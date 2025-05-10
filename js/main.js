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


const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
//timeはミリ秒


//===============================================================
// 文字色変更演出
//===============================================================
const horror_trigger = document.getElementById('horror-trigger');

var isHorrorExe = false;
window.addEventListener('scroll', () => {
  const horror_triggerRect = horror_trigger.getBoundingClientRect();
  const horror_triggerPoint = window.innerHeight / 2 + 100; // 中心より100px下
  if (horror_triggerRect.top < horror_triggerPoint && horror_triggerRect.bottom > horror_triggerPoint) {
    if (!isHorrorExe) {
      isHorrorExe = true;
      start_horror();
    }
  } else {
    document.body.style.color = 'white';
  }
});


let first_flag = true;
/*
 * 0: id名
 * 1: top
 * 2: left (要素10以降はright)
 * 3: フォントサイズ
 * 4: 角度
 */
let horrorWindowList = [
  ['horrorPopup1', "10%", "15%", "6rem", "10deg"],
  ['horrorPopup2', "40%", "40%", "5rem", "-30deg"],
  ['horrorPopup3', "15%", "60%", "6rem", "-15deg"],
  ['horrorPopup4', "70%", "30%", "5rem", "-25deg"],
  ['horrorPopup5', "60%", "75%", "4rem", "-40deg"],
  ['horrorPopup6', "80%", "45%", "5rem", "-20deg"],
  ['horrorPopup7', "50%", "30%", "5rem", "-35deg"],
  ['horrorPopup8', "35%", "50%", "3rem", "-30deg"],
  ['horrorPopup9', "20%", "80%", "6rem", "-50deg"],
  ['horrorPopup10', "85%", "30%", "3rem", "-10deg"],
  ['horrorPopup11', "65%", "45%", "6rem", "10deg"],
  ['horrorPopup12', "80%", "60%", "5rem", "30deg"],
  ['horrorPopup13', "45%", "55%", "6rem", "15deg"],
  ['horrorPopup14', "30%", "80%", "5rem", "25deg"],
  ['horrorPopup15', "20%", "40%", "4rem", "40deg"],
  ['horrorPopup16', "40%", "40%", "3rem", "15deg"],
  ['horrorPopup17', "80%", "20%", "5rem", "35deg"],
  ['horrorPopup18', "70%", "80%", "5rem", "30deg"],
  ['horrorPopup19', "74%", "20%", "6rem", "50deg"],
  ['horrorPopup20', "65%", "90%", "3rem", "10deg"]
];
async function start_horror() {
  let i = 0;
  let sleep_time = 1500;
  let len = horrorWindowList.length;
  let rand = Math.floor(Math.random() * len);
  let horror;

  if(first_flag){
    rand = 0;
    first_flag = false;
    horror = document.getElementById("firstPopup");
  }else{
    horror = document.getElementById(horrorWindowList[rand][0]);
    horror.style.zIndex = rand + 1000;
    horror.style.top = horrorWindowList[rand][1];
    horror.style.left = horrorWindowList[rand][2];
    horror.style.fontSize = horrorWindowList[rand][3];
  horror.style.transform = "translate(-50%,-50%) rotate(" + horrorWindowList[rand][4] + ")";
}
  
  horror.style.display = "block";
  await sleep(2000);
  horror.style.display = "none";
  await sleep(5000);
  isHorrorExe = false;
}


//===============================================================
// 文字色変更演出
//===============================================================
const trigger = document.getElementById('trigger');

var isExe = false;
window.addEventListener('scroll', () => {
  const triggerRect = trigger.getBoundingClientRect();
  const triggerPoint = window.innerHeight / 2 + 100; // 中心より100px下
  if (triggerRect.top < triggerPoint && triggerRect.bottom > triggerPoint) {
    if(!isExe){
      isExe = true;
      start_red();
    }else{
      document.body.style.color = 'red';
    }
  } else {
    document.body.style.color = 'white';
  }
});

async function start_red() {
    document.getElementById('overlay').classList.add('visible');
    await sleep(500);
    $('html, body').css('overflow', 'hidden');
    document.body.style.color = 'red';
    await sleep(500);
    document.getElementById('overlay').classList.remove('visible');
    $('html, body').css('overflow', '');
}

//===============================================================
// 現在時刻取得処理→2時間前時間に変更処理
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
if(gDate.getMinutes() > 30){
  gDate.setHours(gDate.getHours() - 1);
}else{
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
// 追記事項表示時の動的演出
//===============================================================
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
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

const phrases = [
   '見えているだろうか？',
   '現在、この場所が不安定になっていることを確認している。',
   'きっとあの団体が原因だ。',
   'とにもかくにも、何が起こるか分からない。',
   '記録を確認してもらいたいのは山々だが、状況が状況…',
   '確認するのは任意、引き返しても問題はない。',
   '上からになり申し訳ない。だが、確認する場合は十分に注意してほしい。',
   '以上だ。……では、また何処かで。',
   ''
];
isPsExe = false;
async function psDisplay(){
    if(!isPsExe){
      isPsExe = true;
      document.getElementById("ps-click").innerHTML = "";
      await sleep(5000);
      const el = document.querySelector('.effect-text');
      const fx = new TextScramble(el);
      
      let counter = 0;
      const next = () => {
        if(phrases.length == counter){
          isPsExe = false;
          return;
        }
        fx.setText(phrases[counter]).then(() => {
          setTimeout(next, 4500);
        });
        counter++;
      }
      
      next();
    }
}
