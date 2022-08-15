const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TankSchema = new Schema({
  typeId: { type: String, require: true }, // type id: ko phai id
  name: { type: String, require: true }, // name: ko ph
  classType: { type: Number, require: true }, //
  level: { type: Number, require: true },
  armor: { type: Number, require: true },
  speed: { type: Number, require: true },
  rotationSpeed: { type: Number, require: true },
  damage: { type: Number, require: true },
  health: { type: Number, require: true },
  attackSpeed: { type: Number, require: true }, // time hoi ban ko phai attack
  bulletSpeed: { type: Number, require: true }, // 100 ms
  shootingRange: { type: Number, require: true },
  image: { type: String},
  skill1: {
    name: String,
    description: String,
    damage: { type: Number, default: 0 }, // dame nhan tuc thi
    healing: { type: Number, default: 0 }, // hoi mau tuc thi
    range: { type: Number, default: 0 }, // tam xa skill
    image: String,
    // thuoc tinh hieu ung

    // bat loi
    slowled: {
      value: { type: Number, default: 0 },
      time: { type: Number, default: 0 },
    }, // lam cham  vd {value : 0.2 , time : 10}
    stunned: { type: Number, default: 0 }, // thoi gian bi lam choang ko dung dc chieu ko ban dc
    tiedUp: { type: Number, default: 0 }, // thoi gian bi troi van dung dc chieu vs ban dc
    burned: {
      value: { type: Number, default: 0 }, // dame moi lan dot
      times: { type: Number, default: 0 }, // so lan dot
      waiting: { type: Number, default: 0 }, // time giua moi lan dot
    },
    // hieu ung co loi

    healingTime: {
      value: { type: Number, default: 0 }, // value mau moi lan hoi
      times: { type: Number, default: 0 }, // so lan hoi mau
      waiting: { type: Number, default: 0 }, // time giua moi lan hoi mau
    },

    // tang toc do di chuyen
    speedUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },

    // tang mau ao
    virtualBlood: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
    // tang dame
    damagedUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
    // tang giap
    armorUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
    // tang toc danh
    attackSpeedUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
  },

  skill3: {
    name: String,
    description: String,
    damage: { type: Number, default: 0 }, // dame nhan tuc thi
    healing: { type: Number, default: 0 }, // hoi mau tuc thi
    range: { type: Number, default: 0 }, // tam xa skill
    image: String,
    // thuoc tinh hieu ung

    // bat loi
    slowled: {
      value: { type: Number, default: 0 },
      time: { type: Number, default: 0 },
    }, // lam cham  vd {value : 0.2 , time : 10}
    stunned: { type: Number, default: 0 }, // thoi gian bi lam choang ko dung dc chieu ko ban dc
    tiedUp: { type: Number, default: 0 }, // thoi gian bi troi van dung dc chieu vs ban dc
    burned: {
      value: { type: Number, default: 0 }, // dame moi lan dot
      times: { type: Number, default: 0 }, // so lan dot
      waiting: { type: Number, default: 0 }, // time giua moi lan dot
    },
    // hieu ung co loi

    healingTime: {
      value: { type: Number, default: 0 }, // value mau moi lan hoi
      times: { type: Number, default: 0 }, // so lan hoi mau
      waiting: { type: Number, default: 0 }, // time giua moi lan hoi mau
    },

    // tang toc do di chuyen
    speedUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },

    // tang mau ao
    virtualBlood: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
    // tang dame
    damagedUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
    // tang giap
    armorUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
    // tang toc danh
    attackSpeedUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },

    // skill phan don hay dat bom cac kieu la gay dame ngay lap tuc
  },
  skill2: {
    name: String,
    description: String,
    damage: { type: Number, default: 0 }, // dame nhan tuc thi
    healing: { type: Number, default: 0 }, // hoi mau tuc thi
    range: { type: Number, default: 0 }, // tam xa skill
    image: String,
    // thuoc tinh hieu ung

    // bat loi
    slowled: {
      value: { type: Number, default: 0 },
      time: { type: Number, default: 0 },
    }, // lam cham  vd {value : 0.2 , time : 10}
    stunned: { type: Number, default: 0 }, // thoi gian bi lam choang ko dung dc chieu ko ban dc
    tiedUp: { type: Number, default: 0 }, // thoi gian bi troi van dung dc chieu vs ban dc
    burned: {
      value: { type: Number, default: 0 }, // dame moi lan dot
      times: { type: Number, default: 0 }, // so lan dot
      waiting: { type: Number, default: 0 }, // time giua moi lan dot
    },
    // hieu ung co loi

    healingTime: {
      value: { type: Number, default: 0 }, // value mau moi lan hoi
      times: { type: Number, default: 0 }, // so lan hoi mau
      waiting: { type: Number, default: 0 }, // time giua moi lan hoi mau
    },

    // tang toc do di chuyen
    speedUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },

    // tang mau ao
    virtualBlood: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
    // tang dame
    damagedUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
    // tang giap
    armorUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },
    // tang toc danh
    attackSpeedUp: {
      value: { type: Number, default: 0 }, // %
      time: { type: Number, default: 0 },
    },

    // skill phan don hay dat bom cac kieu la gay dame ngay lap tuc
  },
});

module.exports = mongoose.model("Tank", TankSchema);

//
