var express = require('express');
var router = express.Router();
const fs = require('fs')
const request = require('request');
const im = require('imagemagick');

var piexif = require("piexifjs");
/* GET home page. */
let download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
      if(res){
          if(res.statusCode == 200){
              request(uri).pipe(fs.createWriteStream(filename)).on('close',callback);
          }else{
              console.log('loi 1')
              callback(404)
          }
      }else{
          console.log('loi 2')
          callback(404)
      }
  });
};
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/request-image',(req,res) => {
  let url = req.query.url
    let fileName = req.query.fileName
    let uriFile = fileName+'.jpg'
  download(url, uriFile, function(err){
      if(err){
        return res.json({
          message: 'error'
        })
      }
      im.convert([uriFile, '-resize', '2500x2500', uriFile],
          function(err, stdout){
              if (err){
                  return res.json({
                      message: 'error',
                      err: err
                  })
              }
              var jpeg = fs.readFileSync(uriFile);
              var data = jpeg.toString("binary");

              var zeroth = {};
              var exif = {};
              var gps = {};
              // console.log(piexif)


              zeroth[piexif.ImageIFD.ImageDescription] = fileName

              zeroth[piexif.ImageIFD.RatingPercent] = 100

              var exifObj = {"0th":zeroth, "Exif":exif, "GPS":gps};
              var exifbytes = piexif.dump(exifObj);

              var newData = piexif.insert(exifbytes, data);
              var newJpeg = Buffer.from(newData, "binary");
              fs.writeFileSync(uriFile, newJpeg);
              let stream = fs.createReadStream(uriFile);
              stream.on("end", function () {
                  deleteFile(uriFile);
                  // stream.destroy(); // makesure stream closed, not close if download aborted.
                 // deleteFile(uriFile);
              });
              stream.pipe(res)

              // return res.json({message: "success"})
          });

  });
  //   resize({
  //       src: "google.jpg",
  //       dst: "google1.jpg",
  //       height: 1000,
  //       width: 1000
  //   },({name,path,width,height,warnings}) => {
  //       if(warnings){
  //           console.log(warnings)
  //       }
  //       con
  //   })
})
function deleteFile (file) {
    fs.unlink(file, function (err) {
        if (err) {
            console.error(err.toString());
        } else {
            console.warn(file + ' deleted');
        }
    });
}
// router.get('/test',(req,res) => {
//
//
//
//     var filename1 = "google.jpg";
//     var filename2 = "out.jpg";
//
//
// })
// router.get('/test1',(req,res) => {
//     var filename1 = "google1.jpg";
//
//
//     var jpeg = fs.readFileSync(filename1);
//     var data = jpeg.toString("binary");
//     var exifObj = piexif.load(data);
//     for (var ifd in exifObj) {
//         if (ifd == "thumbnail") {
//             continue;
//         }
//         console.log("-" + ifd);
//         for (var tag in exifObj[ifd]) {
//             console.log("  " + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
//         }
//     }
//     return res.json({message : 'success'})
// })
// router.get('/test2',(req,res) => {
//     let string = "XIn chào các bạn"
//     return res.json({
//         byte: [...Buffer.from(string)]
//     })
// })
module.exports = router;
