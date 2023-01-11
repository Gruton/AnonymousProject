## node.js express 익명게시판

- 글 삭제시 버그 수정

```js
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

//------
// 아래는 기존 소스코드
app.post('/auth/:bId', bodyParserMiddleware, (req, res) => {
  const bId = parseInt(req.params.bId);
  const delIndex = board.findIndex(bItem => bItem.bId === Id);
  if (delIndex) { // 여기서 문제가 생김
  // if 구문 안에 delIndex를 그대로 넣었을 때 문제가 생겼다.
  // 만약 delIndex 값이 0이면 (1번 게시글 삭제시)
  // 0은 false 이기 때문에 else 구문으로 가버려 삭제되지 않는다.
  // if 문안에 1, 0, -1 들어가는 것을 잘 확인하자.
    board.splice(delIndex, 1);
    res.redirect('/auth');
  } else { 
    return res.send(404, '404가 왜 나올까?');
  }
});
```

[익명게시판 바로가기](https://anonymousboard-cbckgzveqx.now.sh)