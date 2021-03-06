var express = require('express');
var router = express.Router();
var firebase = require("firebase");
var dateFormat = require('dateformat');
var json2xls = require('json2xls');
var fs = require('fs');

router.get('/', function(req, res, next) {
    res.redirect('boardList');
});

var config = {
    apiKey: "AIzaSyBH0hktrZ2sxM0nCfM7qbvZgCuaa0zfxLw",
    authDomain: "nodejs-example-d01b8.firebaseapp.com",
    databaseURL: "https://nodejs-example-d01b8.firebaseio.com",
    projectId: "nodejs-example-d01b8",
    storageBucket: "nodejs-example-d01b8.appspot.com",
    messagingSenderId: "476305942408"
};
firebase.initializeApp(config);
      
router.get('/boardList', function(req, res, next) {
    firebase.database().ref('board').orderByKey().once('value', function(snapshot) {
        var rows = [];
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
        
            childData.brdno = childSnapshot.key;
            childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
            rows.push(childData);
        });
        res.render('board1/boardList', {rows: rows});
    });
});

router.get('/boardRead', function(req, res, next) {
    firebase.database().ref('board/'+req.query.brdno).once('value', function(snapshot) {
        var childData = snapshot.val();
        
        childData.brdno = snapshot.key;
        childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
        res.render('board1/boardRead', {row: childData});
    });
});

router.get('/boardForm', function(req,res,next){
    if (!req.query.brdno) {
        res.render('board1/boardForm', {row: ""});
        return;
    }

    firebase.database().ref('board/'+req.query.brdno).once('value', function(snapshot) {
        var childData = snapshot.val();
        
        childData.brdno = snapshot.key;
        res.render('board1/boardForm', {row: childData});
    });
});

router.post('/boardSave', function(req,res,next){
    var postData = req.body;
    if (!postData.brdno) {
        postData.brdno = firebase.database().ref().child('posts').push().key;
        postData.brddate = Date.now();
    } else {
        postData.brddate = Number(postData.brddate); 
    }
    firebase.database().ref('board/' + req.body.brdno).set(req.body);
    //var updates = {};
    //updates['/board/' + postData.brdno] = postData;
    //firebase.database().ref().update(updates);
    
    res.redirect('boardList');
});

router.get('/boardDelete', function(req,res,next){
    firebase.database().ref('board/' + req.query.brdno).remove();
    res.redirect('boardList');
});

router.get('/export',function(req,res,next){
    firebase.database().ref('board').orderByKey().once('value', function(snapshot) {
        var rows = [];
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
        
            childData.brdno = childSnapshot.key;
            childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
            rows.push(childData);
        });
        var xls = json2xls(rows);
        fs.writeFileSync('D://exportedExcel.xlsx', xls, 'binary');
        res.redirect('boardList');
    });
});

module.exports = router;
