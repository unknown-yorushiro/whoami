//===============================================================
// メニュー制御用の関数とイベント設定（※バージョン2025-1）
//===============================================================
$(function () {
  //-------------------------------------------------
  // 変数の宣言
  //-------------------------------------------------
  const $menubar = $('#menubar');
  const $menubarHdr = $('#menubar_hdr');
  const breakPoint = 900;	// ここがブレイクポイント指定箇所です

  // ▼ここを切り替えるだけで 2パターンを使い分け！
  //   false → “従来どおり”
  //   true  → “ハンバーガーが非表示の間は #menubar も非表示”
  const HIDE_MENUBAR_IF_HDR_HIDDEN = false;

  // タッチデバイスかどうかの判定
  const isTouchDevice = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0);

  //-------------------------------------------------
  // debounce(処理の呼び出し頻度を抑制) 関数
  //-------------------------------------------------
  function debounce(fn, wait) {
    let timerId;
    return function (...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        fn.apply(this, args);
      }, wait);
    };
  }

  //-------------------------------------------------
  // ドロップダウン用の初期化関数
  //-------------------------------------------------
  function initDropdown($menu, isTouch) {
    // ドロップダウンメニューが存在するliにクラス追加
    $menu.find('ul li').each(function () {
      if ($(this).find('ul').length) {
        $(this).addClass('ddmenu_parent');
        $(this).children('a').addClass('ddmenu');
      }
    });

    // ドロップダウン開閉のイベント設定
    if (isTouch) {
      // タッチデバイスの場合 → タップで開閉
      $menu.find('.ddmenu').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const $dropdownMenu = $(this).siblings('ul');
        if ($dropdownMenu.is(':visible')) {
          $dropdownMenu.hide();
        } else {
          $menu.find('.ddmenu_parent ul').hide(); // 他を閉じる
          $dropdownMenu.show();
        }
      });
    } else {
      // PCの場合 → ホバーで開閉
      $menu.find('.ddmenu_parent').hover(
        function () {
          $(this).children('ul').show();
        },
        function () {
          $(this).children('ul').hide();
        }
      );
    }
  }

  //-------------------------------------------------
  // ハンバーガーメニューでの開閉制御関数
  //-------------------------------------------------
  function initHamburger($hamburger, $menu) {
    $hamburger.on('click', function () {
      $(this).toggleClass('ham');
      if ($(this).hasClass('ham')) {
        $menu.show();
        // ▼ ブレイクポイント未満でハンバーガーが開いたら body のスクロール禁止
        //    （メニューが画面いっぱいに fixed 表示されている時に背後をスクロールさせないため）
        if ($(window).width() < breakPoint) {
          $('body').addClass('noscroll');  // ★追加
        }
      } else {
        $menu.hide();
        // ▼ ハンバーガーを閉じたらスクロール禁止を解除
        if ($(window).width() < breakPoint) {
          $('body').removeClass('noscroll');  // ★追加
        }
      }
      // ドロップダウン部分も一旦閉じる
      $menu.find('.ddmenu_parent ul').hide();
    });
  }

  //-------------------------------------------------
  // レスポンシブ時の表示制御 (リサイズ時)
  //-------------------------------------------------
  const handleResize = debounce(function () {
    const windowWidth = $(window).width();

    // bodyクラスの制御 (small-screen / large-screen)
    if (windowWidth < breakPoint) {
      $('body').removeClass('large-screen').addClass('small-screen');
    } else {
      $('body').removeClass('small-screen').addClass('large-screen');
      // PC表示になったら、ハンバーガー解除 + メニューを開く
      $menubarHdr.removeClass('ham');
      $menubar.find('.ddmenu_parent ul').hide();

      // ▼ PC表示に切り替わったらスクロール禁止も解除しておく (保険的な意味合い)
      $('body').removeClass('noscroll'); // ★追加

      // ▼ #menubar を表示するか/しないかの切り替え
      if (HIDE_MENUBAR_IF_HDR_HIDDEN) {
        $menubarHdr.hide();
        $menubar.hide();
      } else {
        $menubarHdr.hide();
        $menubar.show();
      }
    }

    // スマホ(ブレイクポイント未満)のとき
    if (windowWidth < breakPoint) {
      $menubarHdr.show();
      if (!$menubarHdr.hasClass('ham')) {
        $menubar.hide();
        // ▼ ハンバーガーが閉じている状態ならスクロール禁止も解除
        $('body').removeClass('noscroll'); // ★追加
      }
    }
  }, 200);

  //-------------------------------------------------
  // 初期化
  //-------------------------------------------------
  // 1) ドロップダウン初期化 (#menubar)
  initDropdown($menubar, isTouchDevice);

  // 2) ハンバーガーメニュー初期化 (#menubar_hdr + #menubar)
  initHamburger($menubarHdr, $menubar);

  // 3) レスポンシブ表示の初期処理 & リサイズイベント
  handleResize();
  $(window).on('resize', handleResize);

  //-------------------------------------------------
  // アンカーリンク(#)のクリックイベント
  //-------------------------------------------------
  $menubar.find('a[href^="#"]').on('click', function () {
    // ドロップダウンメニューの親(a.ddmenu)のリンクはメニューを閉じない
    if ($(this).hasClass('ddmenu')) return;

    // スマホ表示＆ハンバーガーが開いている状態なら閉じる
    if ($menubarHdr.is(':visible') && $menubarHdr.hasClass('ham')) {
      $menubarHdr.removeClass('ham');
      $menubar.hide();
      $menubar.find('.ddmenu_parent ul').hide();
      // ハンバーガーが閉じたのでスクロール禁止を解除
      $('body').removeClass('noscroll'); // ★追加
    }
  });

  //-------------------------------------------------
  // 「header nav」など別メニューにドロップダウンだけ適用したい場合
  //-------------------------------------------------
  // 例：header nav へドロップダウンだけ適用（ハンバーガー連動なし）
  //initDropdown($('header nav'), isTouchDevice);
});


//===============================================================
// スムーススクロール（※バージョン2024-1）※通常タイプ
//===============================================================
$(function () {
  // ページ上部へ戻るボタンのセレクター
  var topButton = $('.pagetop');
  // ページトップボタン表示用のクラス名
  var scrollShow = 'pagetop-show';

  // スムーススクロールを実行する関数
  // targetにはスクロール先の要素のセレクターまたは'#'（ページトップ）を指定
  function smoothScroll(target) {
    // スクロール先の位置を計算（ページトップの場合は0、それ以外は要素の位置）
    var scrollTo = target === '#' ? 0 : $(target).offset().top;
    // アニメーションでスムーススクロールを実行
    $('html, body').animate({ scrollTop: scrollTo }, 500);
  }

  // ページ内リンクとページトップへ戻るボタンにクリックイベントを設定
  $('a[href^="#"], .pagetop').click(function (e) {
    e.preventDefault(); // デフォルトのアンカー動作をキャンセル
    var id = $(this).attr('href') || '#'; // クリックされた要素のhref属性を取得、なければ'#'
    smoothScroll(id); // スムーススクロールを実行
  });

  // スクロールに応じてページトップボタンの表示/非表示を切り替え
  $(topButton).hide(); // 初期状態ではボタンを隠す
  $(window).scroll(function () {
    if ($(this).scrollTop() >= 300) { // スクロール位置が300pxを超えたら
      $(topButton).fadeIn().addClass(scrollShow); // ボタンを表示
    } else {
      $(topButton).fadeOut().removeClass(scrollShow); // それ以外では非表示
    }
  });

  // ページロード時にURLのハッシュが存在する場合の処理
  if (window.location.hash) {
    // ページの最上部に即時スクロールする
    $('html, body').scrollTop(0);
    // 少し遅延させてからスムーススクロールを実行
    setTimeout(function () {
      smoothScroll(window.location.hash);
    }, 10);
  }
});


//===============================================================
// 自作関数用グローバル変数定義(初期化)
//===============================================================
/* 緊急警告メッセージ表示前ノイズ */
let noise_color =
["#E0861A",  // 金茶 k
 "#EFF04A",  // 秋の麒麟草 a
 "#E0861A",  // 金茶 k
 "#EFF04A",  // 秋の麒麟草 a
 "#7BBFEA",  // 勿忘草色 w
 "#EFF04A",  // 秋の麒麟草 a
 "#005599",  // 瑠璃色 r
 "#69B076",  // 薄緑 u
 "#72777B",  // 鉛色 n
 "#EFF04A"   // 秋の麒麟草 a
]; //かかわるな
/* 緊急警告のメッセージ内容 */
const phrases = [
  '見えているだろうか？',
  '現在、この場所が不安定になっていることを確認している',
  '想定とは異なる手段で遷移してしまったらしい',
  'きっと邱醍阜陂?ｨｹが原因だ',
  'とにもかくにも、これから何が起こるか分からない',
  '記録を確認してもらいたいのは山々だが、現時点では私は君達の安全を保障できない',
  '故に、このまま引き返してもらっても構わない',
  '上からの表現になり申し訳ない。だが、私も焦っているのだ',
  '改めてになるが、確認する場合は十分に注意してほしい',
  '以上だ。……では、「吉星」に導かれた先の何時かの何処かでまた',
  ''
];

/* 各種id取得 */
/* 読み込み時モーダル表示用id */
const modal = document.querySelector('.js-warning-modal');
const close = document.querySelector('.js-warning-modal-close');
/* 緊急警告表示用id */
const emergencyTrigger = document.getElementById('emergency-trigger');
const emergencyModalContainer = document.querySelector('#modal-container.emergency');
const emergencyModalBackGround = document.querySelector('#modal-container .modal-background .modal');
const displayConnectHeader = document.getElementById("emergency-header");

/* 各種演出起動トリガー */
const horror_trigger = document.getElementById('horror-trigger');
const horror_trigger2 = document.getElementById('horror-trigger2');
const trigger = document.getElementById('trigger');
const final_trigger = document.getElementById('final-trigger');
/* クエリ取得 */
const modalHeader = document.querySelector('.modal-header');

/* 各種フラグ */
let isEmergencyExe = false;         // 緊急警告表示用フラグ
let first_flag = true;              // ホラー演出初回時フラグ
let isRedScreenExe = false;         // 殺害時レッドスクリーン実行フラグ
let isAlreadyRedScreenExe = false;  // レッドスクリーン実行済み判定フラグ
let isRedScreenFinish = false;      // 赤文字演出終了済み判定フラグ
let isHorrorExe = false;
let isHorrorExe2 = false;
/* ホラーポップアップ用 */
let horror;

/* 各種音声の定義 */
const featurephoneringtone = document.getElementById('featurephoneringtone');
const noiseKimoi = document.getElementById('noise_kimoi');
const reivoice = document.getElementById('reivoice');
const whitenoise = document.getElementById('whitenoise');
const bloodsplatter = document.getElementById('bloodsplatter');
const morse = document.getElementById('morse');
/* 各種動画の定義 */
//const noiseMovie = document.getElementById('noise_movie');
const tvnoise = document.getElementById('tvnoise');
/* 音声の初期化 */
featurephoneringtone.pause();
featurephoneringtone.volume = 0.5;
featurephoneringtone.currentTime = 0;
noiseKimoi.pause();
noiseKimoi.volume = 0.5;
noiseKimoi.currentTime = 0;
reivoice.pause();
reivoice.volume = 0.5;
reivoice.currentTime = 0;
whitenoise.pause();
whitenoise.volume = 0.5;
whitenoise.currentTime = 0;
bloodsplatter.pause();
bloodsplatter.volume = 0.5;
bloodsplatter.currentTime = 0;
morse.pause();
morse.volume = 0.3;
morse.currentTime = 0;
/* sleep処理用定義(timeはミリ秒) */
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
/* リロード時、必ずページ最上部に戻す処理 */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}


//===============================================================
// リダイレクト時のアラート文(もっと凝りたいが、現状これ)
//===============================================================
//要素を取得
window.onload = function(){
  modal.classList.add('is-active');
  $('html, body').css('overflow', 'hidden');
}

//「閉じるボタン」をクリックしてモーダルを閉じる
function modalClose() {
  modal.classList.remove('is-active');
  $('html, body').css('overflow', '');
}
close.addEventListener('click', modalClose);


//===============================================================
// 現在時刻を取得し、2時間前の時間に算出する処理
//===============================================================
const now = new Date();
const utc = now.toUTCString();
// 取得された文字列の「GMT」を除去する
const g = utc.replace('GMT', '');
// 除去された文字列を使用し、インスタンスする
const gDate = new Date(g);
const hours = gDate.getHours();
gDate.setHours(hours + 9);
// 2時間前の時刻を取得
if (gDate.getMinutes() > 30) {
  gDate.setHours(gDate.getHours() - 1);
} else {
  gDate.setHours(gDate.getHours() - 2);
}
// 月・日・時を取得（0埋めあり）
const month = String(gDate.getMonth() + 1).padStart(2, '0'); // 月は0-11なので+1
const day = String(gDate.getDate()).padStart(2, '0');
const hour = String(gDate.getHours()).padStart(2, '0');
// 表示形式に整形
const formatted = `${month}月${day}日${hour}時`;
// HTMLに表示
document.getElementById("output").textContent = formatted;


//===============================================================
// 緊急警告ポップアップ演出
//===============================================================
/* 特定の行通過時演出 */
window.addEventListener('scroll', () => {
  const emergencyTriggerRect = emergencyTrigger.getBoundingClientRect();
  const emergencyTriggerPoint = window.innerHeight / 2 + 100; // 中心より100px下
  if (emergencyTriggerRect.top < emergencyTriggerPoint && emergencyTriggerRect.bottom > emergencyTriggerPoint) {
    if (!isEmergencyExe) {
      featurephoneringtone.play();
      isEmergencyExe = true;
      displayPopup();
    }
  }
});

async function displayPopup(){
  await sleep(500);
  $('html, body').css('overflow', 'hidden');
  emergencyModalContainer.style.display = "table";
}

/* モーダルウィンドウボタン(確認する)押下時処理 */
function pushEmergencyModalButton() {
  document.querySelector('.modal-button').style.display = "none";
  /* 現在のテキストを非表示 */
  document.getElementById("emergency-text").innerHTML = "";
  featurephoneringtone.pause();
  connectHeader();
}

/* ボタン押下後接続中擬似演出処理 */
async function connectHeader() {
  let l = 3;
  let color_num = 0;
  let waitCnt = Math.floor(Math.random() * 4) + 6; // 6から9

  /* 初期値変更 */
  modalHeader.style.textAlign = "left";
  modalHeader.style.paddingLeft = "32%";
  displayConnectHeader.innerHTML = "CONNECTING ";
  await sleep(500);
  for (let i = 1; i <= waitCnt; i++) {
    /* 表示色がループするように調整 */
    if (color_num == noise_color.length){
      color_num = 0;
    }else if(color_num != 0){
      color_num++;
    }

    if (i % 4 == 0) {
      emergencyModalBackGround.style.background = noise_color[color_num];
      displayConnectHeader.innerHTML = "CONNECTING ...";
    } else if (i == l) {
      emergencyModalBackGround.style.background = noise_color[color_num];
      displayConnectHeader.innerHTML = "CONNECTING ..";
      l = l + 4;
    } else if (i % 2 == 0) {
      emergencyModalBackGround.style.background = noise_color[color_num];
      displayConnectHeader.innerHTML = "CONNECTING .";
    } else if (i % 2 == 1) {
      emergencyModalBackGround.style.background = noise_color[color_num];
      displayConnectHeader.innerHTML = "CONNECTING ";
    }
    await sleep(100);
    color_num++;
    emergencyModalBackGround.style.background = noise_color[color_num];
    await sleep(100);
    color_num++;

    /* 表示色がループするように調整 */
    if (color_num == noise_color.length){
      color_num = 0;
    }else if(color_num != 0){
      color_num++;
    }

    if (i == waitCnt) {
      emergencyModalBackGround.style.background = "black";
      await sleep(100);
    } else {
      emergencyModalBackGround.style.background = "black";
      await sleep(1000);
    }
  }

  displayConnectHeader.innerHTML = "CONNECTED";
  psDisplay();
}

/* モーダルクローズ処理 */
function closeEmergencyModal() {
  emergencyModalContainer.style.display = "none";
  const cancelEmergencyButton = document.querySelector('.modal-cancel');
  cancelEmergencyButton.classList.add('animation-name');
  $('html, body').css('overflow', '');
}


//===============================================================
// 緊急警告メッセージ表示の動的演出
//===============================================================
async function psDisplay() {
  //await sleep(2500);
  const el = document.querySelector(".effect-text");
  const fx = new TextScramble(el);

  /* スタイルの変更 */
  el.style.textAlign = "left";
  el.style.paddingLeft = "35px";
  el.style.fontSize = "14px";

  emergencyModalBackGround.classList.add('modal-background-change');
  await sleep(5000);

  let counter = 0;
  const next = () => {
    /* メッセージ終了後、閉じるボタンを表示 */
    if (phrases.length == counter) {
      modalHeader.style.paddingLeft = "30%";
      displayConnectHeader.innerHTML = "DISCONNECTED";
      const cancelEmergencyButton = document.querySelector('.modal-cancel');
      cancelEmergencyButton.style.display = "block";
      return;
    }
    fx.setText(phrases[counter]).then(() => {
      setTimeout(next, 4500);
    });
    counter++;
  }

  next();
}

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}


//===============================================================
// ホラーポップアップ表示演出
//===============================================================
/* 1段階目演出 行数判定 */
window.addEventListener('scroll', () => {
  const horror_triggerRect = horror_trigger.getBoundingClientRect();
  const horror_triggerPoint = window.innerHeight / 2 + 100; // 中心より100px下
  if (horror_triggerRect.top < horror_triggerPoint && horror_triggerRect.bottom > horror_triggerPoint) {
    if (!isHorrorExe) {
      isHorrorExe = true;
      startHorrorPopup(0);
    }
  }
});
/* 2段階目演出 行数判定 */
window.addEventListener('scroll', () => {
  const horror_triggerRect2 = horror_trigger2.getBoundingClientRect();
  const horror_triggerPoint2 = window.innerHeight / 2 + 100; // 中心より100px下
  if (horror_triggerRect2.top < horror_triggerPoint2 && horror_triggerRect2.bottom > horror_triggerPoint2) {
    if (!isHorrorExe2) {
      /* 1回目の演出が再度行われないようにする*/
      isHorrorExe = true;
      isHorrorExe2 = true;
      startHorrorPopup(1);
    }
    //} else {
    //  document.body.style.color = 'white'
    //}
  }
});

/*
 * 0: id名
 * 1: top
 * 2: left (要素10以降はright)
 * 3: フォントサイズ
 * 4: 角度
 */
let horrorWindowList = [
  ['horrorPopup1', "10%", "15%", "6rem", "10deg"],
  ['horrorPopup2', "40%", "10%", "5rem", "-30deg"],
  ['horrorPopup3', "15%", "60%", "6rem", "-15deg"],
  ['horrorPopup4', "90%", "30%", "5rem", "-25deg"],
  ['horrorPopup5', "30%", "85%", "4rem", "-40deg"],
  ['horrorPopup6', "80%", "65%", "5rem", "20deg"],
  ['horrorPopup7', "50%", "20%", "5rem", "-35deg"],
  ['horrorPopup8', "25%", "20%", "3rem", "-30deg"],
  ['horrorPopup9', "20%", "80%", "6rem", "45deg"],
  ['horrorPopup10', "85%", "30%", "3rem", "-10deg"],
  ['horrorPopup11', "65%", "85%", "7rem", "10deg"],
  ['horrorPopup12', "80%", "20%", "5rem", "30deg"],
  ['horrorPopup13', "75%", "85%", "6rem", "-15deg"],
  ['horrorPopup14', "30%", "80%", "5rem", "-25deg"],
  ['horrorPopup15', "40%", "20%", "4rem", "40deg"],
  ['horrorPopup16', "24%", "15%", "7rem", "15deg"],
  ['horrorPopup17', "50%", "90%", "5rem", "35deg"],
  ['horrorPopup18', "70%", "80%", "5rem", "30deg"],
  ['horrorPopup19', "74%", "20%", "6rem", "-50deg"],
  ['horrorPopup20', "15%", "30%", "6rem", "10deg"]
];
let i_horror = 0;
let variables = [];
async function startHorrorPopup(effect_pattern) {
  let sleep_time = 1500;
  let len = horrorWindowList.length;
  let rand = Math.floor(Math.random() * len);
  let voice_rand = Math.floor(Math.random() * 2);

  /* デバッグ時書き換え
  let rand = 19;
  first_flag = false;*/

  if (first_flag) {
    rand = 0;
    voice_rand = 1;
    first_flag = false;
    horror = document.getElementById("firstPopup");
  } else {
    horror = document.getElementById(horrorWindowList[rand][0]);
    horror.style.zIndex = rand + 1000;
    horror.style.top = horrorWindowList[rand][1];
    horror.style.left = horrorWindowList[rand][2];
    horror.style.fontSize = horrorWindowList[rand][3];
    horror.style.transform = "translate(-50%,-50%) rotate(" + horrorWindowList[rand][4] + ")";
  }

  if (voice_rand == 0) {
    noiseKimoi.play();
  } else if (voice_rand == 1) {
    reivoice.play();
  }

  /* 一定の行数通過で処理速度を上げ、文字が消えないようにする */
  if (effect_pattern == 0) {
    horror.style.display = "block";
    await sleep(2000);
    horror.style.display = "none";
    if (voice_rand == 0) {
      noiseKimoi.pause();
      noiseKimoi.currentTime = 0;
    } else if (voice_rand == 1) {
      reivoice.pause();
     reivoice.currentTime = 0;
  }
    await sleep(5000);
    isHorrorExe = false;
  } else if (effect_pattern == 1) {
    if (len != 0) {
      variables[i_horror] = horror;
      horrorWindowList.splice(rand, 1);
      variables[i_horror].style.display = "block";
      await sleep(2000);
      i_horror++;
      isHorrorExe2 = false;
    }
  }
}


//===============================================================
// 殺害演出
//===============================================================
window.addEventListener('scroll', () => {
  const triggerRect = trigger.getBoundingClientRect();
  const triggerPoint = window.innerHeight / 2 + 100; // 中心より100px下
  if (triggerRect.top < triggerPoint && triggerRect.bottom > triggerPoint) {
    if (!isRedScreenExe) {
      isRedScreenExe = true;
      isHorrorExe = true;
      isHorrorExe2 = true;
      frontCoverRedScreen();
    } else {
      if(isRedScreenFinish){
        document.body.style.color = 'red';
      }
    }
  } else {
    document.body.style.color = 'white';
    if(isAlreadyRedScreenExe){
      isRedScreenFinish = true;
      isHorrorExe = true;
      isHorrorExe2 = true;
    }
  }
});

async function frontCoverRedScreen() {
  document.getElementById('overlay').classList.add('visible');
  $('html, body').css('overflow', 'hidden');
  noiseKimoi.pause();
  reivoice.pause();

  await sleep(500);
  bloodsplatter.play();
  document.body.style.color = 'red';
  await sleep(500);

  /* ホラー演出表示したポップアップメニューを非表示にする*/
  horror.style.display = "none";
  for (let i = 0; i < variables.length; i++) {
    variables[i].style.display = "none";
  }
  document.getElementById('overlay').classList.remove('visible');
  $('html, body').css('overflow', '');
}


//===============================================================
// 最終演出
//===============================================================
var isFinalEffectExe = false;
window.addEventListener('scroll', () => {
  const ftriggerRect = final_trigger.getBoundingClientRect();
  const ftriggerPoint = window.innerHeight / 2 + 100; // 中心より100px下
  if (ftriggerRect.top < ftriggerPoint && ftriggerRect.bottom > ftriggerPoint) {
    if (!isFinalEffectExe) {
      isFinalEffectExe = true;
      startFinalEffect();
    }
  }
});

async function startFinalEffect() {
  $('html, body').css('overflow', 'hidden');
  tvnoise.style.display = "flex";
  tvnoise.play();
  tvnoise.muted = false;
  whitenoise.play();

  await sleep(500);
  morse.play();
  //再生モールス：DON'T FIND THE MAGATSU

  await sleep(8500);
  stopAssets(tvnoise, 0);
  stopAssets(whitenoise, 1);

  const a = document.createElement('a');
  a.href = './assets/files/PASS=十六夜家に関係のある神話生物_Format=English.pdf'; // 相対または絶対パス
  a.download = 'PASS=十六夜家に関係のある神話生物_Format=English.pdf';       // 保存時のファイル名
  a.click();
  
  window.open('about:blank','_self').close()
  //window.close();
}

function stopAssets(assetId, assetType) {
  if (assetType == 0) {
    assetId.pause();
    assetId.currentTime = 0;
    assetId.muted = true;
  } else if (assetType == 1) {
    assetId.pause();
    assetId.currentTime = 0;
  }
}
