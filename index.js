const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const app = express();
const Joi = require("@hapi/joi");
const _ = require("lodash");
const excelToJson = require("convert-excel-to-json");
const fs = require("fs");
require("dotenv").config();
mongoose.pluralize(null);

let url = process.env.MONGODB_URI;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to mongoDB...");
  })
  .catch((err) => {
    console.log("could not connect to mongoDB...", err);
  });

const courseSchema = new mongoose.Schema({
  playerName: String,
  role: String,
  price: String,
  matches: [Object],
  details: String,
  Captain: String,
  overseas: String,
  Dream11: String,
});

const pointsSchema = new mongoose.Schema({
  "Points Table": [Object],
});

global.__basedir = __dirname;

// -> Multer Upload Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

function validate(excelData) {
  // JOI schema
  // validate
  const profileSchema = Joi.object({
    playerName: Joi.string().required(),
    role: Joi.string().required(),
    price: Joi.string().required(),
  });

  for (let team in excelData) {
    excelData[team].slice(1).map((data) => {
      const { error, value } = profileSchema.validate(data);
      if (!error) {
        // console.log("Success")
      } else {
        console.log("Failure", error.details[0].message);
        return false;
      }
    });
  }
  return true;
}

// -> Import Excel File to MongoDB database
function importExcelData2MongoDB(filePath, fileName) {
  // -> Read Excel File to Json Data
  const excelData = excelToJson({
    sourceFile: filePath,
    sheets: [
      {
        name: "RCB",
        columnToKey: {
          A: "playerName",
          B: "role",
          C: "price",
          D: "overseas",
          E: "Captain",
          F: "Dream11",
        },
      },
      {
        name: "MI",
        columnToKey: {
          A: "playerName",
          B: "role",
          C: "price",
          D: "overseas",
          E: "Captain",
          F: "Dream11",
        },
      },
      {
        name: "CSK",
        columnToKey: {
          A: "playerName",
          B: "role",
          C: "price",
          D: "overseas",
          E: "Captain",
          F: "Dream11",
        },
      },
      {
        name: "DC",
        columnToKey: {
          A: "playerName",
          B: "role",
          C: "price",
          D: "overseas",
          E: "Captain",
          F: "Dream11",
        },
      },
      {
        name: "KXIP",
        columnToKey: {
          A: "playerName",
          B: "role",
          C: "price",
          D: "overseas",
          E: "Captain",
          F: "Dream11",
        },
      },
      {
        name: "KKR",
        columnToKey: {
          A: "playerName",
          B: "role",
          C: "price",
          D: "overseas",
          E: "Captain",
          F: "Dream11",
        },
      },
      {
        name: "RR",
        columnToKey: {
          A: "playerName",
          B: "role",
          C: "price",
          D: "overseas",
          E: "Captain",
          F: "Dream11",
        },
      },
      {
        name: "SRH",
        columnToKey: {
          A: "playerName",
          B: "role",
          C: "price",
          D: "overseas",
          E: "Captain",
          F: "Dream11",
        },
      },
    ],
  });

  // console.log('EXCEL DATA', excelData)

  // Insert Json-Object to MongoDB
  let result = validate(excelData);
  if (result) {
    for (let data in excelData) {
      let documents = excelData[data].slice(1);
      const Course = mongoose.model(data, courseSchema);
      Course.insertMany(documents, (err, res) => {
        if (err) {
          console.log("ERROR", data);
          throw err;
        }
        console.log("Number of documents inserted: ", data, res.length);
        /**
              Number of documents inserted: 5
          */
        // db.close();
      });
    }
    fs.unlinkSync(filePath);
  }
}

function importPointsTableData2MongoDB(filePath, fileName) {
  const excelData = excelToJson({
    sourceFile: filePath,
    sheets: [
      {
        name: "Points Table",
        columnToKey: {
          A: "Team",
          B: "Played",
          C: "Won",
          D: "Lost",
          E: "Points",
        },
      },
    ],
  });
  const Course = mongoose.model("Points Table", pointsSchema);
  let pointsTable = {
    "Points Table": excelData["Points Table"].slice(1),
  };
  let course = new Course(pointsTable);
  course.save(function (err, data) {
    if (err) {
      console.log("ERROR", data);
      throw err;
    } else {
      console.log("Number of documents inserted: ", data);
    }
  });
}

function importTeamData2MongoDB(filePath, fileName, team1, team2) {
  // -> Read Excel File to Json Data
  const excelData = excelToJson({
    sourceFile: filePath,
    sheets: [
      {
        name: team1,
        columnToKey: {
          A: "PlayerName",
          B: "Score",
          C: "Wicket",
          D: "Balls",
          E: "SR",
          F: "4s",
          G: "6s",
          H: "Overs",
          I: "Runs",
          J: "Wickets",
          K: "Maiden",
          L: "Eco",
          M: "Catches",
          N: "Stumps",
          O: "Dream11",
          P: "Date",
          Q: "Venue",
          R: "Result",
        },
      },
      {
        name: team2,
        columnToKey: {
          A: "PlayerName",
          B: "Score",
          C: "Wicket",
          D: "Balls",
          E: "SR",
          F: "4s",
          G: "6s",
          H: "Overs",
          I: "Runs",
          J: "Wickets",
          K: "Maiden",
          L: "Eco",
          M: "Catches",
          N: "Stumps",
          O: "Dream11",
          P: "Date",
          Q: "Venue",
          R: "Result",
        },
      },
    ],
  });
  // Insert Json-Object to MongoDB
  // let result = validate(excelData);
  // if (result) {
  //console.log("EXCEL DATA", excelData);
  for (let data in excelData) {
    let team = "";
    if (team1 === data) {
      team = team2;
    } else if (team2 === data) {
      team = team1;
    }
    let details = excelData[data].slice(1, 2);
    let documents = excelData[data].slice(2);
    const Course = mongoose.model(data, courseSchema);
    documents.map(async (a, index) => {
      await Course.find({ playerName: a.PlayerName }, async function (
        err,
        docs
      ) {
        if (docs) {
          let totalPoints = 0;
          let updated = [
            ...docs[0].matches,
            {
              team: team,
              PlayerName: a.PlayerName,
              Score: a.Score,
              Wicket: a.Wicket,
              Balls: a.Balls,
              SR: a.SR,
              "4s": a["4s"],
              "6s": a["6s"],
              Overs: a.Overs,
              Runs: a.Runs,
              Wickets: a.Wickets,
              Maiden: a.Maiden,
              Eco: a.Eco,
              Catches: a.Catches,
              Stumps: a.Stumps,
              Dream11: a["Dream11"],
              Date: details[0].Date,
              Venue: details[0].Venue,
              Result: details[0].Result,
            },
          ];
          totalPoints += parseInt(a["Dream11"]);
          docs.map((d) => {
            d.matches.map((data) => {
              totalPoints += parseInt(data["Dream11"]);
            });
          });
          await Course.findOneAndUpdate(
            { playerName: a.PlayerName },
            {
              $set: {
                matches: updated,
                Dream11: totalPoints,
              },
            },
            (err, res) => {
              if (err) {
                console.log("storing issue");
              } else {
                //fs.unlinkSync(filePath);
                //console.log("matchesss", res);
              }
            }
          );
        }
      });
    });

    //     Course.insertMany(documents, (err, res) => {
    //       if (err) {
    //         console.log("ERRORRRRRRRR", data);
    //         throw err;
    //       }
    //       console.log("Number of documents inserted: ", data, res.length);
    //       /**
    //             Number of documents inserted: 5
    //         */
    //       // db.close();
    //     });
    //   }
    //   fs.unlinkSync(filePath);
    // }
  }
}
app.post("/api/teamdata", upload.single("teamdatafile"), async (req, res) => {
  try {
    await importTeamData2MongoDB(
      __basedir + "/uploads/" + req.file.filename,
      req.file.originalname.split(".")[0].replace(/ /g, "").trim(" "),
      req.query.team1,
      req.query.team2
    );
    res.json({
      msg: "File uploaded/import successfully!",
      //file: req.file,
    });
  } catch {
    res.status(400).send("Error occured while uploading to MongoDB");
  }
});

app.get("/api/getPointsTable", (req, res) => {
  const Course = mongoose.model("Points Table", pointsSchema);
  Course.find({}, function (err, data) {
    if (err) {
      res.send("Error uploading data", err);
    } else {
      res.send(data);
    }
  });
});

app.post(
  "/api/pointsTableData",
  upload.single("pointsTableFile"),
  async (req, res) => {
    try {
      await importPointsTableData2MongoDB(
        __basedir + "/uploads/" + req.file.filename,
        req.file.originalname.split(".")[0].replace(/ /g, "").trim(" ")
      );
      res.json({
        msg: "Points Table File uploaded/import successfully!",
        //file: req.file,
      });
    } catch {
      res.status(400).send("Error occured while uploading to MongoDB");
    }
  }
);

// -> Express Upload RestAPIs
app.post("/api/uploadfile", upload.single("uploadfile"), async (req, res) => {
  try {
    await importExcelData2MongoDB(
      __basedir + "/uploads/" + req.file.filename,
      req.file.originalname.split(".")[0].replace(/ /g, "").trim(" ")
    );
    res.json({
      msg: "File uploaded/import successfully!",
      //file: req.file,
    });
  } catch {
    res.status(400).send("Error occured while uploading to MongoDB");
  }
});

app.get("/api/getdata/:team", (req, res) => {
  const Course = mongoose.model(req.params.team, courseSchema);
  Course.find({}, function (err, data) {
    if (err) {
      res.send("Error uploading data", err);
    } else {
      res.send(data);
    }
  });
});

app.post("/api/savedata", (req, res) => {
  const Course = mongoose.model(req.body.franchise, courseSchema);
  let course = new Course(
    _.pick(req.body, ["playerName", "score", "role", "highScore", "franchise"])
  );
  course.save(function (err, data) {
    if (err) {
      res.send(err);
    } else {
      res.send({ data: "Record has been Inserted..!!" });
    }
  });
});

app.post("/api/userData", (req, res) => {
  const Course = mongoose.model(req.body.team, courseSchema);
  Course.find({ playerName: req.body.name }, function (err, data) {
    if (err) {
      res.send("Error uploading data", err);
    } else {
      res.send(data);
    }
  });
});

app.get("/test", (req,res) => {
	res.send("Server is Wok=rking!!")
})

app.listen(5000, () => {
  console.log("SERVER is listining to 5000");
});
