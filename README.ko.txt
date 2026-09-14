Better Logic Library에 오신 것을 환영합니다.

Homey용 고급 로직 라이브러리로, 변수와 라이브러리 관리를 제공합니다.

이 앱은 Homey에 Better Logic과 라이브러리를 제공합니다:
* 스마트하고 통합적인 방식으로 변수 관리.
* Math.js 같은 Better Logic의 고급 액션 및 조건 카드.
* 변수를 직접 관리할 수 있는 장치.
* 날짜 및 시간 형식 지정, 완전히 사용자 정의 가능하며 다른 앱과 공유.
* 다른 앱의 플로우카드 내에서 직접 사용할 수 있는 BLL 코딩 및 BLL 표현식.
* BLL 코딩 및 BLL 표현식 내에서 사용할 수 있는 사용자 지정 함수.
* BLL 코딩 및 BLL 표현식에 사용할 수 있는 라이브러리, Math.js나 Lodash 같은.
* 다른 앱이 사용할 수 있는 파일 서버로, LAN에서 파일을 제공하거나 Homey 모바일 앱이나 개발자 도구에서 다운로드 가능.
* 다른 앱이 사용할 수 있는 라이브러리로, 앱 크기와 중복을 줄이고 관리를 개선.
* 파일 서버나 다른 BLL 기능을 사용하는 변수 관리 API.

모든 기능과 설명은 (새로운) 앱 설정에서 확인하세요. 지원되는 앱의 BLL 코딩 같은 내용도 있습니다!

예제 BLL 코딩: 텍스트 인자 내에 - Hello, today is {[date("dddd")]} -를 배치하면, BLL이 자동으로 텍스트 내의 이러한 표현식을 찾아 디코드하여 - Hello, today is monday -로 변환합니다.

또한: 플로에서 변수를 직접 관리하세요!

모든 when- 및 then카드에 변수를 입력하고 목록에서 선택하면 변수가 자동으로 생성됩니다.
태그를 사용하고 싶다면 먼저 저장을 누르세요.
플로 내에서 자동으로 생성된 변수는 더 이상 플로우카드에서 사용되지 않으면 자동으로 삭제됩니다.
변수는 설정 화면에서도 관리할 수 있습니다. 이러한 변수는 사용되지 않더라도 자동으로 삭제되지 않으며 수동으로 삭제해야 합니다.

삭제 버튼에는 이제 확인이 필요합니다!

* 기능: GET, 모든 변수 GET 및 값을 SET(게시)하기 위한 API 지원 추가.
    * GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME
    * 모든 변수를 가져오기 위해 GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL
    * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/VALUE  //값 유형이 일치하지 않으면 설정되지 않습니다.
* 기능: API 트리거 호출
    * 증가를 위한 PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/VARIABLENAME 이 변수 호출
* 기능: API에 증가 또는 감소 추가 호출
    * 증가를 위한 PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/i/VALUE  해당 값만큼 변수 증가
    * 감소를 위한 PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/d/VALUE  해당 값만큼 변수 감소
* 기능: API 지원을 위한 부울(toggle) 추가
    * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/toggle 이로 인해 부울 값이 반전됩니다

* 기능: mathjs를 위한 특수 변수로 $timenow$ 추가. 이것은 초 단위로 현 시대 시간을 검색합니다. 이 변수는 개요에 저장되지 않고 표현식에서 사용됩니다.
* 기능: Math.js 플로우에서 timenow 외에 #DD(일), #MM(월), #YYYY(년), #HH(시간), #mm(분), #SS(초)를 예약어로 추가했습니다. 이제 #HH를 변수에 할당하여 시간을 가져올 수 있습니다. 또한 일관성을 위해 timenow를 #timenow로 변경했습니다.