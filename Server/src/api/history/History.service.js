const History = require("./History.schema");

class HistoryService {
  async insertMatchHistory({
    teamWin,
    team1Kill,
    gameMode,
    team2Kill,
    members,
    time,
  }) {
    try {
      if (teamWin != 1 && teamWin != 2) {
        throw new Error("Wrong team");
      }
      if (gameMode == "CountKill") {
        if (team1Kill > team2Kill && teamWin != 1) {
          throw new Error("Wrong team win");
        }

        if (team1Kill < team2Kill && teamWin != 2) {
          throw new Error("Wrong team win");
        }
      }
      return await new History({
        teamWin,
        team1Kill,
        gameMode,
        team2Kill,
        members,
        time,
      }).save();
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getUserHistory(_id, top) {
    const history = await History.aggregate([
      {
        $match: { "members.userId": _id },
      },
      {
        $unwind: "$members",
      },
      {
        $lookup: {
          from: "users",
          let: {
            userIdSearch: {
              $toObjectId: "$members.userId",
            },
          },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$_id", "$$userIdSearch"] }] },
              },
            },
            {
              $project: { password: 0, __v: 0 },
            },
          ],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "tankusers",
          let: {
            tankUserIdSearch: {
              $toObjectId: "$members.tank",
            },
          },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$_id", "$$tankUserIdSearch"] }] },
              },
            },
            {
              $project: { __v: 0 },
            },
          ],
          as: "tank1",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $set: { "members.user": "$user" },
      },
      {
        $unwind: "$tank1",
      },
      {
        $lookup: {
          from: "tanks",
          let: {
            tankIdSearch: {
              $toObjectId: "$tank1.tankId",
            },
          },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$_id", "$$tankIdSearch"] }] },
              },
            },
            {
              $project: { typeId: 1, classType: 1, name: 1, level: 1 },
            },
          ],
          as: "tank2",
        },
      },
      {
        $unwind: "$tank2",
      },
      {
        $set: { "members.tank": "$tank2" },
      },
      {
        $group: {
          _id: "$_id",
          members: {
            $push: "$members",
          },
          gameMode: { $first: "$gameMode" },
          teamWin: { $first: "$teamWin" },
          team1Kill: { $first: "$team1Kill" },
          team2Kill: { $first: "$team2Kill" },
          time: { $first: "$time" },
        },
      },
      {
        $sort: { time: -1 },
      },
      {
        $limit: +top,
      },
    ]);

    return history.map((h) => {
      return {
        ...h,
        members: h.members.map((e) => {
          if (e.userId == _id) {
            return { ...e, isMe: true };
          }
          return { ...e, isMe: false };
        }),
      };
    });
  }
  async getUserSummary(_id) {
    const sumary = await History.aggregate([
      {
        $match: { "members.userId": _id },
      },
      {
        $unwind: "$members",
      },
      {
        $match: { "members.userId": _id },
      },
      {
        $project: {
          win: {
            $cond: [
              {
                $eq: ["$members.isWin", true],
              },
              1,
              0,
            ],
          },
          lose: {
            $cond: [
              {
                $eq: ["$members.isWin", false],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id,
          win: { $sum: "$win" },
          lose: { $sum: "$lose" },
        },
      },
      {
        $project: {
          _id: 0,
          win: "$win",
          lose: "$lose",
          winRate: {
            $divide: ["$win", { $sum: ["$win", "$lose"] }],
          },
        },
      },
    ]);
    return sumary;
  }
}

module.exports = new HistoryService();
