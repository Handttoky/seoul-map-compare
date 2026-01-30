let map;
let overlay1963, overlay1969, overlay1975;

// ▼ 검색용 Geocoder, 자동완성(Autocomplete), 검색 결과 마커
let geocoder;
let autocomplete;
let searchMarker = null;

// ▼ 즐겨찾기 마커를 관리하는 객체 (favoriteId → Marker)
let favoriteMarkers = {};

function initMap() {
  const centerLat = 37.5331;
  const centerLng = 126.9760;

  // 지도 생성
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: centerLat, lng: centerLng },
    zoom: 12,
    restriction: {
      latLngBounds: {
        north: 37.7,
        south: 37.4,
        west: 126.8,
        east: 127.2
      },
      strictBounds: false
    }
  });

  // Geocoder & Autocomplete 초기화
  geocoder = new google.maps.Geocoder();
  initAutocomplete();

  // 검색 버튼
  const searchButton = document.getElementById('search-button');
  searchButton.addEventListener('click', handleSearch);

  // 과거 지도 (1963, 1969, 1975)
  const imageUrl1963 = 'images/1963.12.31_서울특별시_도시계획국_시설계획과.png';
  const bounds1963 = getBounds(centerLat, centerLng, 1597, 688, 0.11);
  overlay1963 = new google.maps.GroundOverlay(imageUrl1963, bounds1963);
  overlay1963.setMap(null);

  const imageUrl1969 = 'images/1969.12.31_서울특별시_도시계획국_시설계획과.png';
  const bounds1969 = getBounds(centerLat, centerLng, 1597, 688, 0.11);
  overlay1969 = new google.maps.GroundOverlay(imageUrl1969, bounds1969);
  overlay1969.setMap(null);

  const imageUrl1975 = 'images/1975.06.11_서울특별시_도시계획국_시설계획과.png';
  const bounds1975 = getBounds(centerLat, centerLng, 1597, 688, 0.11);
  overlay1975 = new google.maps.GroundOverlay(imageUrl1975, bounds1975);
  overlay1975.setMap(null);

  // 투명도 슬라이더
  const opacitySlider = document.getElementById('opacitySlider');
  opacitySlider.addEventListener('input', () => {
    const opacity = parseFloat(opacitySlider.value);
    overlay1963.setOpacity(opacity);
    overlay1969.setOpacity(opacity);
    overlay1975.setOpacity(opacity);
  });

  // ▼ 두 개의 패널(로그인/회원가입, 즐겨찾기) 드래그 가능
  makePanelDraggable(document.getElementById('loginPanel'));
  makePanelDraggable(document.getElementById('favoritesPanel'));
}

// (패널 드래그 기능)
function makePanelDraggable(panel) {
  let isDown = false;
  let offsetX = 0;
  let offsetY = 0;

  panel.addEventListener('mousedown', (e) => {
    isDown = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    panel.style.zIndex = 9999; // Bring to front
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    panel.style.left = (e.pageX - offsetX) + 'px';
    panel.style.top = (e.pageY - offsetY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDown = false;
  });
}

// 자동완성
function initAutocomplete() {
  const input = document.getElementById('search-input');
  autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "kr" },
    fields: ["geometry", "formatted_address", "name"],
    bounds: { south: 37.4, west: 126.8, north: 37.7, east: 127.2 },
    strictBounds: false
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      alert("검색 결과가 없습니다.");
      return;
    }
    goToLocation(place.geometry.location, place.formatted_address || place.name);
  });
}

// 검색 버튼 로직
function handleSearch() {
  const addressInput = document.getElementById('search-input');
  const address = addressInput.value.trim();
  if (!address) {
    alert("검색어를 입력하세요!");
    return;
  }
  geocoder.geocode({ address }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
      if (results.length === 1) {
        goToLocation(results[0].geometry.location, results[0].formatted_address);
      } else {
        showResultsList(results);
      }
    } else {
      alert("검색 결과가 없습니다. (에러코드: " + status + ")");
    }
  });
}

// 다중 결과 선택
function showResultsList(results) {
  let message = "다음 중 어느 위치를 원하시나요?\n";
  results.forEach((r, i) => {
    message += `${i + 1}. ${r.formatted_address}\n`;
  });
  const choice = prompt(message);
  const idx = parseInt(choice, 10) - 1;
  if (idx >= 0 && idx < results.length) {
    goToLocation(results[idx].geometry.location, results[idx].formatted_address);
  } else {
    alert("유효한 번호가 아닙니다.");
  }
}

// 지도 이동 + 검색 마커
function goToLocation(location, titleText) {
  map.setCenter(location);
  map.setZoom(14);

  if (!searchMarker) {
    searchMarker = new google.maps.Marker({ map });
  }
  searchMarker.setPosition(location);
  searchMarker.setTitle(titleText || "검색 위치");
}

// 연도별 지도 토글
function toggle1963() {
  overlay1969.setMap(null);
  overlay1975.setMap(null);
  if (overlay1963.getMap() === map) overlay1963.setMap(null);
  else overlay1963.setMap(map);
}
function toggle1969() {
  overlay1963.setMap(null);
  overlay1975.setMap(null);
  if (overlay1969.getMap() === map) overlay1969.setMap(null);
  else overlay1969.setMap(map);
}
function toggle1975() {
  overlay1963.setMap(null);
  overlay1969.setMap(null);
  if (overlay1975.getMap() === map) overlay1975.setMap(null);
  else overlay1975.setMap(map);
}

// 지도 이미지 범위 계산
function getBounds(centerLat, centerLng, originalWidth, originalHeight, imageLatSpan) {
  const imageLngSpan = imageLatSpan * (originalWidth / originalHeight);
  return {
    north: centerLat + imageLatSpan / 2,
    south: centerLat - imageLatSpan / 2,
    east: centerLng + imageLngSpan / 2,
    west: centerLng - imageLngSpan / 2
  };
}

// ▼ 회원가입, 로그인, 즐겨찾기

// (1) 회원가입
async function registerUser() {
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const name = document.getElementById('reg-name').value;
  if(!email || !password || !name){
    alert("이메일, 비밀번호, 이름 모두 입력해주세요.");
    return;
  }

  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  const data = await res.json();
  if(res.ok){
    alert("회원가입 성공!");
  } else {
    alert(data.message || "회원가입 실패");
  }
}

// (2) 로그인
async function loginUser() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  if(!email || !password){
    alert("이메일과 비밀번호를 입력해주세요.");
    return;
  }
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if(res.ok){
    alert(data.message || "로그인 성공!");

    // ▼ 로그인 패널 숨기고 즐겨찾기 패널 보이기
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('favoritesPanel').style.display = 'block';

    // 로그인 후 즐겨찾기 목록
    getFavorites();
  } else {
    alert(data.message || "로그인 실패");
  }
}

// (3) 로그아웃
async function logoutUser() {
  const res = await fetch('/auth/logout');
  if(res.ok){
    const data = await res.json();
    alert(data.message || "로그아웃 완료");

    // 즐겨찾기 목록 비우기
    renderFavorites([]);

    // 즐겨찾기 패널 숨기고 로그인 패널 다시 보이기
    document.getElementById('favoritesPanel').style.display = 'none';
    document.getElementById('loginPanel').style.display = 'block';
  }
}

// (4) 즐겨찾기 목록 조회
async function getFavorites() {
  const res = await fetch('/favorites');
  if(!res.ok){
    console.log("즐겨찾기 목록 조회 실패");
    return;
  }
  const list = await res.json(); 
  renderFavorites(list);
}

// (5) 즐겨찾기 등록
async function addFavorite() {
  const title = document.getElementById('fav-title').value;
  if(!title){
    alert("장소명을 입력하세요");
    return;
  }
  // 지도 중심(예시) 좌표를 즐겨찾기로 등록
  const { lat, lng } = map.getCenter().toJSON();

  const res = await fetch('/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, lat, lng })
  });
  const data = await res.json();
  if(res.ok){
    alert("즐겨찾기 추가 완료");
    getFavorites(); 
  } else {
    alert(data.message || "즐겨찾기 추가 실패");
  }
}

// 즐겨찾기 목록 표시 + 파란 마커
function renderFavorites(list) {
  const favList = document.getElementById('favorites-list');
  favList.innerHTML = '';

  // (A) 기존 마커 제거
  for (const favId in favoriteMarkers) {
    favoriteMarkers[favId].setMap(null);
  }
  favoriteMarkers = {};

  // (B) 새 목록 표시 & 마커 생성
  list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `[${item.title}] lat:${item.lat}, lng:${item.lng}`;

    // 삭제 버튼
    const delBtn = document.createElement('button');
    delBtn.textContent = '삭제';
    delBtn.style.marginLeft = '10px';
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      await deleteFavorite(item.id);
      getFavorites();
    };
    li.appendChild(delBtn);

    // 클릭 → 지도 이동
    li.onclick = () => {
      map.setCenter({ lat: parseFloat(item.lat), lng: parseFloat(item.lng) });
      map.setZoom(14);
    };

    favList.appendChild(li);

    // (C) 파란색 마커 생성
    const marker = new google.maps.Marker({
      position: { lat: parseFloat(item.lat), lng: parseFloat(item.lng) },
      map: map,
      title: item.title,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    // 저장 (삭제 시 제거하기 위해)
    favoriteMarkers[item.id] = marker;
  });
}

// (6) 즐겨찾기 삭제
async function deleteFavorite(favId) {
  const res = await fetch(`/favorites/${favId}`, { method: 'DELETE' });
  if(!res.ok){
    const data = await res.json();
    alert(data.message || "삭제 실패");
  }
}
