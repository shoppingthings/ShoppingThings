// js/tutorial-controller.js

/**
 * 튜토리얼 팝업 및 진행을 관리하는 컨트롤러 객체
 * (index.html의 메인 스크립트에서 사용되는 state, renderRooms, loadStateFromURL 등의 전역 함수에 의존함)
 */
const TutorialController = {
    popupEl: null,
    backdropEl: null,
    currentStep: 0,
    steps: [
        {
            title: "환영합니다!",
            text: "ShoppingThings의 스마트홈 체크리스트 튜토리얼을 시작합니다.",
            actions: [{ text: "시작", next: true }]
        },
        {
            title: "1단계: 방 추가 및 이름 설정",
            text: "하단의 <b>'방 추가'</b> 버튼을 누르고, 새 방의 이름을 설정하세요.",
            targetId: "btn-add-room",
            targetClass: "animate-bounce ring-4 ring-brand/50",
            position: "bottom-center",
            actions: [{ text: "다음", next: true }]
        },
        {
            title: "2단계: 기기 입력 준비",
            text: "추가한 방을 클릭해 펼치고, 중앙의 **'새 기기 검색'** 입력창을 찾아보세요.",
            targetId: "input-room-0-search",
            targetClass: "animate-pulse ring-4 ring-brand/50",
            position: "bottom-center",
            actions: [{ text: "다음", next: true }]
        },
        {
            title: "3단계: 기기 검색 및 추가",
            text: "구매할 기기의 이름을 검색하고 **'+ 추가'** 버튼을 누르세요. (예: 큐브캠)",
            targetId: "btn-add-device-0",
            targetClass: "animate-bounce ring-4 ring-brand/50",
            position: "left-top",
            actions: [{ text: "다음", next: true }]
        },
        {
            title: "4단계: 기기 정보 확인",
            text: "추가된 기기의 행을 터치/클릭하여 상세 정보(호환성, 프로토콜)를 확인하고 수정할 수 있습니다.",
            targetId: "row-0",
            targetClass: "animate-pulse ring-4 ring-brand/50",
            position: "right-center",
            actions: [{ text: "다음", next: true }]
        },
        {
            title: "5단계: 자동화 점수 분석",
            text: "상단의 **'Automation Score'**를 확인하세요. 추가한 기기들의 시너지를 분석해 점수로 환산합니다. (클릭하여 상세 분석 확인)",
            targetId: "pas-wrapper",
            targetClass: "animate-pulse ring-4 ring-brand/50",
            position: "bottom-center",
            actions: [{ text: "다음", next: true }]
        },
        {
            title: "6단계: 결과 공유 및 저장",
            text: "우측 상단 메뉴에서 **'PNG로 저장'**을 선택하여 현재 목록을 이미지로 공유하거나 저장할 수 있습니다.",
            targetId: "btn-gnb-more",
            targetClass: "animate-bounce ring-4 ring-brand/50",
            position: "bottom-right",
            actions: [{ text: "다음", next: true }]
        },
        {
            title: "마지막 단계: 앱 설치 (PWA)",
            text: "이 앱은 PWA(웹앱)입니다. 설치 버튼을 눌러 앱처럼 사용하거나, 모바일 브라우저의 '홈 화면에 추가'를 통해 설치할 수 있습니다.",
            targetId: "btn-install",
            targetClass: "animate-bounce ring-4 ring-brand/50",
            position: "bottom-right",
            actions: [{ text: "완료", close: true }]
        },
    ],

    init() {
        this.popupEl = document.getElementById('tutorial-popup');
        this.backdropEl = document.getElementById('tutorial-backdrop');
        this.updateStep(0); // 팝업이 로드될 때 첫 단계로 초기화
    },

    updateStep(stepIdx) {
        this.currentStep = stepIdx;
        const step = this.steps[stepIdx];
        if (!step || !this.popupEl) return;

        // 1. 내용 업데이트
        document.getElementById('tuto-title').innerText = step.title;
        document.getElementById('tuto-text').innerHTML = step.text;

        // 2. 액션 버튼 업데이트
        const actionContainer = document.getElementById('tuto-actions');
        actionContainer.innerHTML = '';
        step.actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'px-4 py-2 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-colors';
            btn.innerText = action.text;

            if (action.next) {
                btn.onclick = () => this.nextStep();
            } else if (action.close) {
                btn.onclick = () => this.close();
            }
            actionContainer.appendChild(btn);
        });

        // 3. 타겟 요소 하이라이트
        this.clearHighlight();
        if (step.targetId) {
            const target = document.getElementById(step.targetId);
            if (target) {
                // targetClass는 띄어쓰기로 구분되어 있으므로, 배열로 분리하여 추가합니다.
                target.classList.add('tutorial-highlight', ...(step.targetClass.split(' ')));
                this.positionPopup(target, step.position);
            }
        } else {
            this.positionPopup(null, 'center');
        }
    },

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.updateStep(this.currentStep + 1);
        } else {
            this.close();
        }
    },

    open() {
        if (this.currentStep === this.steps.length - 1) {
             this.updateStep(0); // 끝까지 갔으면 처음으로 리셋
        }
        if (!this.popupEl || !this.backdropEl) {
             // 튜토리얼 팝업 엘리먼트가 아직 DOM에 로드되지 않았다면 init을 강제 호출
             this.init(); 
        }
        this.popupEl.classList.add('open');
        this.backdropEl.classList.add('active');
        document.body.classList.add('overflow-hidden');
        this.updateStep(this.currentStep); // 현재 단계를 다시 렌더링하여 하이라이트 업데이트
        
        // 튜토리얼 시작 시 목록을 초기화하고 기본 방을 하나 추가
        // renderRooms 함수와 state 객체는 메인 스크립트에 정의되어 있어야 함
        if (typeof state !== 'undefined' && typeof renderRooms === 'function') {
            state.rooms = [{
                id: 'r_tuto',
                name: '내 집',
                isCollapsed: false,
                rows: [{
                    __rid: 'tuto_row_1',
                    device: '큐브캠',
                    capability: ['monitoring', 'motionSensor', 'video'],
                    protocol: 'wifi',
                    isSupported: true,
                    isCertified: true,
                    isLocked: false,
                    count: 1
                }]
            }];
            renderRooms();
            // 튜토리얼 진행 중 GNB를 내립니다. (모바일의 경우)
            document.getElementById('gnb')?.classList.add('hidden');
        }
        
        // PWA 설치 버튼이 없으면 7단계로 건너뛰거나 닫음
        if (this.currentStep === 7 && document.getElementById('btn-install')?.classList.contains('hidden')) {
            this.close();
        }
    },

    close() {
        this.popupEl.classList.remove('open');
        this.backdropEl.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
        this.clearHighlight();
        
        // 튜토리얼 종료 시 목록을 초기 상태로 복원
        // loadStateFromURL 함수는 메인 스크립트에 정의되어 있어야 함
        if (typeof loadStateFromURL === 'function') {
            loadStateFromURL();
        }
        
        // GNB를 다시 보여줍니다.
        document.getElementById('gnb')?.classList.remove('hidden');
    },

    clearHighlight() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight', 'animate-bounce', 'animate-pulse', 'ring-4', 'ring-brand/50');
        });
        document.getElementById('tutorial-popup').style.transform = '';
    },

    positionPopup(target, position) {
        const popup = this.popupEl;
        popup.style.transform = 'translate(-50%, -50%)'; // 초기 중앙 위치
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.maxWidth = '360px'; // 기본값

        if (!target) return; // 타겟이 없으면 중앙에 둠

        const targetRect = target.getBoundingClientRect();
        const popupWidth = popup.offsetWidth;
        const popupHeight = popup.offsetHeight;
        const padding = 20;

        let top = '50%';
        let left = '50%';
        let transform = 'translate(-50%, -50%)';

        // 팝업 위치 계산 로직
        switch (position) {
            case 'bottom-center':
                top = `${targetRect.bottom + padding + window.scrollY}px`;
                left = `${targetRect.left + targetRect.width / 2}px`;
                transform = 'translate(-50%, 0)';
                break;
            case 'top-center':
                top = `${targetRect.top - popupHeight - padding + window.scrollY}px`;
                left = `${targetRect.left + targetRect.width / 2}px`;
                transform = 'translate(-50%, 0)';
                break;
            case 'left-top':
                top = `${targetRect.top + window.scrollY}px`;
                left = `${targetRect.left - popupWidth - padding}px`;
                transform = 'translate(0, 0)';
                break;
            case 'right-center':
                top = `${targetRect.top + targetRect.height / 2 + window.scrollY}px`;
                left = `${targetRect.right + padding}px`;
                transform = 'translate(0, -50%)';
                break;
            case 'center':
            default:
                top = '50%';
                left = '50%';
                transform = 'translate(-50%, -50%)';
        }

        popup.style.top = top;
        popup.style.left = left;
        popup.style.transform = transform;
        
        // 팝업이 화면 밖으로 나가는 것을 방지 (간단한 처리)
        if (popup.getBoundingClientRect().top < 0) {
            popup.style.top = `${padding + window.scrollY}px`;
            popup.style.transform = 'translate(-50%, 0)';
        }
    }
};

// DOM이 완전히 로드된 후 튜토리얼 컨트롤러를 초기화합니다.
document.addEventListener('DOMContentLoaded', () => TutorialController.init());