// 'DOMContentLoaded' 이벤트는
// index.html 파일이 브라우저에 모두 로드되었을 때를 의미합니다.
document.addEventListener('DOMContentLoaded', () => {
  
  const appContainer = document.getElementById('app');

  function handleResize() {
    const content = appContainer.firstElementChild;
    if (!content) return;

    // 0. transform을 초기화하여 콘텐츠의 원래 크기를 가져옵니다.
    content.style.transform = 'scale(1)';
    const contentWidth = content.offsetWidth;
    const contentHeight = content.offsetHeight;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 1. 가로와 세로 비율 중 더 작은 값을 기준으로 스케일을 계산합니다.
    const scale = Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight);

    // 2. 계산된 스케일을 적용하고, 화면 중앙에 위치시킵니다.
    content.style.transformOrigin = 'top left';
    content.style.transform = `scale(${scale})`;
    content.style.left = `${(viewportWidth - contentWidth * scale) / 2}px`;
    content.style.top = `${(viewportHeight - contentHeight * scale) / 2}px`;
  }

  fetch('content.html') 
    .then(response => {
      if (!response.ok) {
        throw new Error('파일을 불러오는 데 실패했습니다.');
      }
      return response.text(); 
    })
    .then(htmlData => {
      appContainer.innerHTML = htmlData;
      // 콘텐츠가 로드된 후, 리사이즈 로직을 한 번 실행합니다.
      handleResize(); 
      // 창 크기가 변경될 때마다 리사이즈 로직을 다시 실행합니다.
      window.addEventListener('resize', handleResize);
    })
    .catch(error => {
      console.error('Fetch 오류:', error);
      document.getElementById('app').innerHTML = '<p>콘텐츠를 로드할 수 없습니다.</p>';
    });

  // --- 물결 파동 애니메이션 코드 시작 ---

  const canvas = document.getElementById('ripple-canvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas(); // 초기 로드 시에도 캔버스 크기 설정

  let ripples = []; // 생성된 물결들을 저장할 배열

  // 물결(Ripple)의 속성을 정의하는 클래스
  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = 500; // 물결의 최대 크기
      this.speed = 2;      // 물결이 퍼지는 속도
      this.life = 1;       // 물결의 생명 (1에서 시작하여 0이 되면 사라짐)
    }

    // 매 프레임마다 물결의 상태를 업데이트하는 함수
    update() {
      this.radius += this.speed;
      // 반지름이 커질수록 life 값을 줄여서 투명도를 높임
      if (this.radius < this.maxRadius) {
        this.life = 1 - (this.radius / this.maxRadius);
      } else {
        this.life = 0;
      }
    }

    // 캔버스에 물결을 그리는 함수
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      // 물결의 색상과 투명도 설정 (rgba의 마지막 값은 투명도)
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.life})`;
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }

  // 캔버스를 클릭했을 때 새로운 물결 생성
  canvas.addEventListener('click', (e) => {
    ripples.push(new Ripple(e.clientX, e.clientY));
  });

  // 애니메이션 실행 함수
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 매 프레임마다 캔버스를 깨끗하게 지움
    ripples.forEach((ripple, index) => {
      ripple.update();
      ripple.draw();
      if (ripple.life <= 0) {
        ripples.splice(index, 1); // 생명이 다한 물결은 배열에서 제거
      }
    });
    requestAnimationFrame(animate); // 다음 프레임 요청
  }

  animate(); // 애니메이션 시작
});