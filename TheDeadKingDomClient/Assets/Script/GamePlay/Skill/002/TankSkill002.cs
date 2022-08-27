using UnityEngine;
using System.Collections;
using SocketIO;

public class TankSkill002 : MonoBehaviour
{

    [SerializeField]
    private Transform bulletSpawnPoint;

    [SerializeField]
    private NetworkIdentity networkIdentity;
    SkillOrientationData skdata;
    RegionSkill rData;
    private GameUI gameUI;
    private NetworkClient networkClient;
    // Start is called before the first frame update
    float time1 = 0f;
    float time2 = 0f;
    float time3 = 0f;

    void Start()
    {
        skdata = new SkillOrientationData();
        skdata.direction = new Position();
        skdata.position = new Position();

        rData = new RegionSkill();
        rData.position = new Position();
        if (networkIdentity.IsControlling())
        {
            NetworkClient.OnTimeSkillUpdate2 += OnTimeSkillUpdate2;

        }
    }
    // Update is called once per frame
    void Update()
    {
        if (!ChatBoxInfor.IsTurnChatBox && networkIdentity.IsControlling())
        {
            var tankGen = networkIdentity.GetComponent<TankGeneral>();
            if (!tankGen.Stunned)
            {
                if (time1 <= 0.3)
                    Skill1();
                if (time2 <= 0.3)
                    Skill2();
            }
            if (time3 <= 0.3)
                Skill3();
        }
    }

    private void OnTimeSkillUpdate2(SocketIOEvent E)
    {
        time1 = E.data["time1"].f;
        time2 = E.data["time2"].f;
        time3 = E.data["time3"].f;

        Debug.Log(time1 + " lala");
    }
    // skill e phong 1 luong nang luong lam cham ke dich tren duong di
    private void Skill1()
    {
        if (!ChatBoxInfor.IsTurnChatBox && Input.GetKeyDown(KeyCode.E))
        {
            //Define skill1
            skdata.activator = NetworkClient.ClientID;
            skdata.num = 1;
            skdata.typeId = networkIdentity.TypeId;
            skdata.position.x = bulletSpawnPoint.position.x.TwoDecimals();
            skdata.position.y = bulletSpawnPoint.position.y.TwoDecimals();
            skdata.direction.x = bulletSpawnPoint.up.x;
            skdata.direction.y = bulletSpawnPoint.up.y;

            //Send skill1
            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(skdata)));
        }

    }

    // skill r phong day xich troi ke dich dau tien gap phai
    private void Skill2()
    {
        if (!ChatBoxInfor.IsTurnChatBox && Input.GetKeyDown(KeyCode.R))
        {
            Vector3 mousePosition = Camera.main.ScreenToWorldPoint(Input.mousePosition);

            rData.activator = NetworkClient.ClientID;
            rData.num = 2;
            rData.typeId = networkIdentity.TypeId;
            rData.position.x = mousePosition.x.TwoDecimals();
            rData.position.y = mousePosition.y.TwoDecimals();

            //Send skill1
            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(rData)));
        }

    }

    private void Skill3()
    {
        if (!ChatBoxInfor.IsTurnChatBox && Input.GetKeyDown(KeyCode.Space))
        {
            rData.activator = NetworkClient.ClientID;
            rData.num = 3;
            rData.typeId = networkIdentity.TypeId;
            rData.position.x = transform.position.x.TwoDecimals();
            rData.position.y = transform.position.y.TwoDecimals();

            //Send skill1
            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(rData)));
        }
    }
}
