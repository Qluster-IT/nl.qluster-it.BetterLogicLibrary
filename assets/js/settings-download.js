(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.SettingsDownload = factory();
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';

    const subscriptions = new WeakMap();
    function subscribe(homey, ready, failed) {
        let entry = subscriptions.get(homey);
        if (!entry) {
            entry = { listeners: new Set() };
            entry.ready = (link) => entry.listeners.forEach((listener) => listener.ready(link));
            entry.failed = (link) => entry.listeners.forEach((listener) => listener.failed(link));
            homey.on('downloadFileReady', entry.ready);
            homey.on('downloadFileFailed', entry.failed);
            subscriptions.set(homey, entry);
        }
        const listener = { ready, failed };
        entry.listeners.add(listener);
        return () => {
            entry.listeners.delete(listener);
            const remove = homey.off || homey.removeListener;
            if (!entry.listeners.size && typeof remove === 'function') {
                remove.call(homey, 'downloadFileReady', entry.ready);
                remove.call(homey, 'downloadFileFailed', entry.failed);
                subscriptions.delete(homey);
            }
        };
    }

    // Kept identical in SSL's settings so older installed BLL assets remain compatible.
    function create(options) {
        const homey = options.homey;
        const schedule = options.setTimeout || setTimeout;
        const unschedule = options.clearTimeout || clearTimeout;
        let current;
        let expiryTimer;
        let destroyed = false;
        let state = { busy: false, error: '', status: '', url: '', cloudUrl: '' };
        const publish = (changes) => {
            state = Object.assign({}, state, changes);
            if (!destroyed) options.changed(state);
        };
        const text = (key) => homey.__('settingsDownload.' + key);
        function clearLink() {
            if (expiryTimer) unschedule(expiryTimer);
            expiryTimer = null;
        }
        function start(type) {
            if (destroyed || current) return Promise.resolve(false);
            clearLink();
            let resolve;
            const result = new Promise((done) => { resolve = done; });
            const op = current = { token: null, early: new Map(), timers: new Set(), opening: false };
            const active = () => current === op && !destroyed;
            const timer = (fn, delay) => {
                const id = schedule(() => { op.timers.delete(id); if (active()) fn(); }, delay);
                op.timers.add(id);
                return id;
            };
            const cancelTimer = (id) => { unschedule(id); op.timers.delete(id); };
            const finish = (error) => {
                if (!active()) return;
                current = null;
                op.timers.forEach(unschedule);
                op.timers.clear();
                if (op.unsubscribe) op.unsubscribe();
                publish({ busy: false, error: error || '', status: state.url ? state.status : '' });
                resolve(!error);
            };
            op.finish = finish;
            const failure = (key) => finish(text(key));
            const probe = (url, callback) => {
                let settled = false;
                const done = (ok) => {
                    if (settled || !active()) return;
                    settled = true;
                    cancelTimer(timeout);
                    callback(ok);
                };
                const timeout = timer(() => done(false), options.probeTimeout || 4000);
                try {
                    Promise.resolve(options.probe(url)).then(() => done(true), () => done(false));
                } catch (error) { done(false); }
            };
            const showLink = (url, cloudUrl) => {
                publish({ url, cloudUrl: cloudUrl !== url ? cloudUrl : '', status: text('ready') });
                clearLink();
                expiryTimer = schedule(() => {
                    expiryTimer = null;
                    if (!destroyed) publish({ url: '', cloudUrl: '', status: '', error: text('expired') });
                }, options.linkTimeout || 30000);
            };
            const open = (url, cloudUrl) => {
                if (!active()) return;
                showLink(url, cloudUrl);
                const timeout = timer(() => failure('openUnconfirmed'), options.openTimeout || 5000);
                let settled = false;
                const opened = (error) => {
                    if (settled || !active()) return;
                    settled = true;
                    cancelTimer(timeout);
                    if (error) failure('openFailed');
                    else finish();
                };
                try {
                    // Homey may return void (or an emit result), not a promise.
                    const returned = homey.openURL(url, opened);
                    if (returned && typeof returned.then === 'function') returned.then(() => opened(), opened);
                } catch (error) { opened(error); }
            };
            const process = (event, isFailure) => {
                if (!active() || op.opening) return;
                if (isFailure) return failure('generationFailed');
                op.opening = true;
                const link = Object.assign({}, op.link, event);
                const valid = (url) => typeof url === 'string' && /^https?:\/\/[^/\s]+(?:\/|$)/i.test(url);
                const cloud = valid(link.cloudUrl) ? link.cloudUrl : '';
                const local = valid(link.localUrl) ? link.localUrl : '';
                // A failed HEAD can also mean browser CORS restrictions; retain a manual route.
                if (cloud || local) showLink(cloud || local, '');
                const tryCloud = () => {
                    if (!cloud) return failure('networkFailed');
                    probe(cloud, (ok) => ok ? open(cloud, cloud) : failure('networkFailed'));
                };
                if (local) probe(local, (ok) => ok ? open(local, cloud) : tryCloud());
                else tryCloud();
            };
            const event = (link, isFailure) => {
                if (!active() || !link || typeof link.token !== 'string' || !link.token) return;
                if (op.token) {
                    if (link.token === op.token) process(link, isFailure);
                } else {
                    if (op.early.size >= 32) op.early.delete(op.early.keys().next().value);
                    op.early.set(link.token, { link, isFailure });
                }
            };
            const ready = (link) => event(link, false);
            const failed = (link) => event(link, true);
            publish({ busy: true, error: '', status: text('preparing'), url: '', cloudUrl: '' });
            timer(() => failure('timeout'), options.timeout || 120000);
            try {
                op.unsubscribe = subscribe(homey, ready, failed);
                homey.api('GET', options.path + encodeURIComponent(type), null, (error, link) => {
                    if (!active() || op.token) return;
                    if (error || !link || typeof link.token !== 'string' || !link.token) return failure('reservationFailed');
                    op.token = link.token;
                    op.link = link;
                    const early = op.early.get(link.token);
                    op.early.clear();
                    if (early) process(early.link, early.isFailure);
                });
            } catch (error) { failure('reservationFailed'); }
            return result;
        }
        function dispose() {
            if (current) current.finish();
            clearLink();
            publish({ busy: false, url: '', cloudUrl: '', status: '' });
            destroyed = true;
        }
        return { start, dispose };
    }

    function bind(options) {
        const scope = options.scope;
        const view = options.view;
        const download = create({
            homey: options.homey,
            path: options.path,
            probe: (url) => options.http({ method: 'HEAD', url, timeout: 4000 }),
            changed: (state) => scope.$evalAsync(() => {
                view.downloadBusy = state.busy;
                view.downloadError = state.error;
                view.downloadStatus = state.status;
                view.downloadUrl = state.url;
                view.downloadCloudUrl = state.cloudUrl;
            })
        });
        scope.$on('$destroy', download.dispose);
        return download;
    }
    return { create, bind };
}));
