using System;
using System.Collections.Generic;

[Serializable]
public class MatchHistory
{
    public string _id;
    public List<Member> members;
    public float teamWin;
    public float team1Kill;
    public float team2Kill;
    public string time;
    public string gameMode;

}


[Serializable]
public class Member
{
    public string userId;
    public Tank tank;
    public float team;
    public bool isWin;
    public float kill;
    public float dead;
    public bool isMe;
    public UserInfor user;
}
