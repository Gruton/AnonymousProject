// -------모듈 로딩-------
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const basicAuth = require('express-basic-auth');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const db = require('mysql');
const { response } = require('express');
const app = express();

const pool = db.createPool({
  host : 'localhost',
  port : 3306,
  user : 'nodejs_admin',
  password : '1234',
  database : 'login',
  connectionLimit : 10
});


// -------미들웨어 로딩-------
const basicAuthMiddleware = basicAuth({
  users: { 'admin': '1234' },
  challenge: true,
  realm: 'Imb4T3st4pp'
})
const bodyParserMiddleware = bodyParser.urlencoded({ extended: false });  // body-parser 미들웨어 설정

// -------db-------
const board = [
  { bId: 1, bTitle: '안녕하세요!', bContents: '반갑습니다', bWriter: '익명'
  },
  { bId: 2, bTitle: '잡담', bContents: '앨랠래', bWriter: 'ㅇㅇ'
  },
  { bId: 3, bTitle: '게임 하실분 있나요', bContents: '댓글좀', bWriter: 'ㄴㄴ'
  },
  { bId: 4, bTitle: '안아줘요', bContents: '안아줘요', bWriter: 'ㅂㅂ'
  },
  { bId: 5, bTitle: 'ㅁㄴㅇㄹ', bContents: 'ㅁㄴㅇㄻㄴㅇㄻㄴㄹㄴㅁㅇㄹ', bWriter: '네네'
  },
];

const partyboard = [
  { bId: 1, bTitle: '문의가 아닌 글은 삭제 조치 하겠습니다', bContents:'문의 해주세요', bWriter: '관리자'
  },
  { bId: 2, bTitle: '글 좀 삭제 해주세요', bContents: 'ㅇㅇ', bWriter: '익명'
  },
  { bId: 3, bTitle: '글삭 부탁', bContents: 'ㅇㅇ', bWriter: '익명'
  },
  { bId: 4, bTitle: '이런거 해도되나요', bContents: 'ㅇㅇ', bWriter: '익명'
  },
  { bId: 5, bTitle: '앨랠래', bContents: 'ㅇㅇ', bWriter: '익명'
  },
];

const comments = [
  { cId: 1,
    cComment: '안녕하세요~',
    cWriter: 'it'
  },
  { cId: 1,
    cComment: '반갑습니다!',
    cWriter: 'ㅋㅋ'
  },
  { cId: 2,
    cComment: 'ㅋㅋ',
    cWriter: '후'
  },
];
const partycomments = [
  { cId: 1,
    cComment: '알겠습니다',
    cWriter: '운영자'
  },
  { cId: 1,
    cComment: '넵',
    cWriter: 'ㅋㅋ'
  },
  { cId: 2,
    cComment: '처리완료',
    cWriter: '운영자'
  },
];


// -------앱 사용-------
app.set('view engine', 'ejs');  // ejs 설정
app.use('/static', express.static('./public')); // static 설정
app.use(morgan('tiny'));  // morgan 설정
app.use(express.urlencoded({extended:false}));
app.use(session({
  secret : 'abc',
  resave : false,
  saveUninitialized : false,
  store : new FileStore()
}));
app.post ('/logout', (request, response)=>{
  request.session.destroy();
});
app.post('/login', async (request, response)=>{
  const id = request.body.user_id;
  const pw = request.body.user_pw;
  let conn;
  try{
      conn = await pool.getConnection();
      let str=`select * from users where userid="${id}" and userpw=password("${pw}");`;
      const rows = await conn.query(str);
      if(rows == 0){
          console.log('로그인실패');
          response.send('<script>alert("로그인실패");</script>');
      }else{
          console.log('로그인성공');
          let userid = rows[0].userid;
          response.send('<script>alert("로그인성공");</script>');
          //response.send(`<h1>${id}님 로그인성공</h1>`);
      }
  }catch(e){
      throw e;
  }finally{
      if(conn)
          return conn.release();
  }
});
app.get('/',(request, response)=>{
  if(request.session.logined){
    response.render('index.ejs',{ok:request.session.user, login:1});
  }else{
    response.render('index.ejs', {ok:"", login:0});
  }
})
// ***index 화면 GET***
app.get('/index', (req, res) => {
  res.render('index', { board });
});

app.get('/party', (req, res) => {
  res.render('party', { partyboard });
});

app.get('/health', (req, res) => {
  res.render('health', { healthboard });
});

// ***로그인 화면 GET***
app.get('/auth', (req, res) => {
  res.render('auth', { board });
});
app.get('/auth2',  (req, res) => {
  res.render('auth2', { partyboard });
});
app.get('/signie', (req, res) => {
  res.render('signie', { board });
});
// ***write 화면 GET***
app.get('/write', (req, res) => {
  res.render('write');
});
app.get('/partywrite', (req, res) => {
  res.render('partywrite');
});
// ***view 화면 GET***
app.get('/view/:bId', (req, res) => {
  const bId = parseInt(req.params.bId); // string -> number
  const matchedBoard = board.find(bItem => bItem.bId === bId); // bId와 일치한 글 내용
  const matchedComments = comments.filter(cItem => cItem.cId === bId); // cId와 일치한 댓글 내용

  if (matchedBoard) {
    res.render('view', { matchedBoard, matchedComments });
  } else {
    res.status(404);
    res.send('404가 왜 뜰까?');
  }
});

app.get('/partyview/:bId', (req, res) => {
  const bId = parseInt(req.params.bId); // string -> number
  const pamatchedBoard = partyboard.find(bItem => bItem.bId === bId); // bId와 일치한 글 내용
  const pamatchedComments = partycomments.filter(cItem => cItem.cId === bId); // cId와 일치한 댓글 내용


if (pamatchedBoard) {
res.render('partyview', { pamatchedBoard, pamatchedComments });
} else {
res.status(404);
res.send('404가 왜 뜰까?');
}
});

app.get('/healthview/:bId', (req, res) => {
  const bId = parseInt(req.params.bId); // string -> number
  const healmatchedBoard = healthboard.find(bItem => bItem.bId === bId); // bId와 일치한 글 내용
  const healmatchedComments = healthcomments.filter(cItem => cItem.cId === bId); // cId와 일치한 댓글 내용


if (healmatchedBoard) {
res.render('healthview', { healmatchedBoard, healmatchedComments });
} else {
res.status(404);
res.send('404가 왜 뜰까?');
}
});
// ***익명게시판 글쓰기 POST***
app.post('/write', bodyParserMiddleware, (req, res) => {
  const bId = board[board.length -1] ? board[board.length -1].bId + 1 : 1;
  const bTitle = req.body.bTitle;
  const bContents = req.body.bContents;
  const bWriter = req.body.bWriter;

  if (bId, bTitle, bContents, bWriter) {
    board.push({ bId, bTitle, bContents, bWriter });
    res.redirect('/index');
  } else {
    res.status(400);
    res.send('400 잘못된 요청입니다. 제대로 입력하세요!');
  }
});

app.post('/partywrite', bodyParserMiddleware, (req, res) => {
    const bId = partyboard[partyboard.length - 1] ? partyboard[partyboard.length - 1].bId + 1 : 1;
    const bTitle = req.body.bTitle;
    const bContents = req.body.bContents;
    const bWriter = req.body.bWriter;

    if (bId, bTitle, bContents, bWriter) {
      partyboard.push({ bId, bTitle, bContents, bWriter });
        res.redirect('/party');
    } else {
        res.status(400);
        res.send('400 잘못된 요청입니다. 제대로 입력하세요!');
    }
});

// ***익명게시판 댓글쓰기 POST***
app.post('/view/:bId', bodyParserMiddleware, (req, res) => {
  let bId = req.params.bId; // uri에 있는 보드 아이디값
  let cId = parseInt(bId);  // 댓글 아이디와 보드 아이디를 일치시키기 위해 cId에 number로 저장
  
  const cComment = req.body.cComment;
  const cWriter = req.body.cWriter;
  const matchedComments = board.find(bItem => bItem.bId === cId);

  if (matchedComments) {
    comments.push({ cId, cComment, cWriter });
    res.redirect(`/view/${bId}`);
  } else {
    res.status(400);
    res.send('400 잘못된 요청입니다. 댓글을 제대로 입력하세요!');
  }
});

app.post('/partyview/:bId', bodyParserMiddleware, (req, res) => {
    let bId = req.params.bId; // uri에 있는 보드 아이디값
    let cId = parseInt(bId);  // 댓글 아이디와 보드 아이디를 일치시키기 위해 cId에 number로 저장

    const cComment = req.body.cComment;
    const cWriter = req.body.cWriter;
    const pamatchedComments = partyboard.find(bItem => bItem.bId === cId);

    if (pamatchedComments) {
        partycomments.push({ cId, cComment, cWriter });
        res.redirect(`/partyview/${bId}`);
    } else {
        res.status(400);
        res.send('400 잘못된 요청입니다. 댓글을 제대로 입력하세요!');
    }
});

app.post('/healthview/:bId', bodyParserMiddleware, (req, res) => {
    let bId = req.params.bId; // uri에 있는 보드 아이디값
    let cId = parseInt(bId);  // 댓글 아이디와 보드 아이디를 일치시키기 위해 cId에 number로 저장

    const cComment = req.body.cComment;
    const cWriter = req.body.cWriter;
    const healmatchedComments = board.find(bItem => bItem.bId === cId);

    if (healmatchedComments) {
        comments.push({ cId, cComment, cWriter });
        res.redirect(`/healthview/${bId}`);
    } else {
        res.status(400);
        res.send('400 잘못된 요청입니다. 댓글을 제대로 입력하세요!');
    }
});
// ***익명게시판 관리자 글삭제 POST***
app.post('/auth/:bId', bodyParserMiddleware, (req, res) => {
  const bId = parseInt(req.params.bId); // 파라미터에서 갖고 온 값이라 스트링. 따라서 넘버로 바꿔준다.
  const matchedIndex = board.findIndex(bItem => bItem.bId === bId); // 파라미터에서 갖고온 id 값과 board에 있는 id와 비교해 일치하는 index 값을 가져온다.
  
  if (matchedIndex === false) {  // 일치하는 값이 없으면 404 에러 보내준다.
    res.send(404, '404 Not Found');
  }
  board.splice(matchedIndex, 1);  // 일치한 값은 삭제한다.
  res.redirect('/auth');
});
app.post('/auth2/:bId', bodyParserMiddleware, (req, res) => {
  const bId = parseInt(req.params.bId); // 파라미터에서 갖고 온 값이라 스트링. 따라서 넘버로 바꿔준다.
  const matchedIndex = partyboard.findIndex(bItem => bItem.bId === bId); // 파라미터에서 갖고온 id 값과 board에 있는 id와 비교해 일치하는 index 값을 가져온다.
  
  if (matchedIndex === false) {  // 일치하는 값이 없으면 404 에러 보내준다.
    res.send(404, '404 Not Found');
  }
  partyboard.splice(matchedIndex, 1);  // 일치한 값은 삭제한다.
  res.redirect('/auth2');
});

// -------앱 리슨-------
app.listen(3000, () => {
  console.log('listening to 3000 port');
});