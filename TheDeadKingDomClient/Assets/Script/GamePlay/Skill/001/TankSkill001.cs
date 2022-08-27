using System;
using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;

public class TankSkill001 : MonoBehaviour
{

    [SerializeField]
    private Transform bulletSpawnPoint;

    [SerializeField]
    private NetworkIdentity networkIdentity;
    SkillOrientationData sk1;
    float time1 = 0f;
    float time2 = 0f;
    float time3 = 0f;
    // Start is called before the first frame update
    void Start()
    {
        time1 = 0f;
        time2 = 0f;
        time3 = 0f;
        sk1 = new SkillOrientationData();
        sk1.direction = new Position();
        sk1.position = new Position();
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
                Debug.Log("can user skill " + time1);

                if (time1 <= 0.3)
                {
                    Debug.Log("can user skill");
                    Skill1();

                }
                if (time2 <= 0.3)
                    Skill2();
                if (time3 <= 0.3)
                    Skill3();
            }
        }
    }

    private void OnTimeSkillUpdate2(SocketIOEvent E)
    {
        time1 = E.data["time1"].f;
        time2 = E.data["time2"].f;
        time3 = E.data["time3"].f;
        Debug.Log(time1 + " lala 1");

    }

    // skill e phong 1 luong nang luong lam cham ke dich tren duong di
    private void Skill1()
    {
        if (!ChatBoxInfor.IsTurnChatBox && Input.GetKeyDown(KeyCode.E))
        {
            Debug.Log("Sent skill 1");
            //Define skill1
            sk1.activator = NetworkClient.ClientID;
            sk1.num = 1;
            sk1.typeId = networkIdentity.TypeId;
            sk1.position.x = bulletSpawnPoint.position.x.TwoDecimals();
            sk1.position.y = bulletSpawnPoint.position.y.TwoDecimals();
            sk1.direction.x = bulletSpawnPoint.up.x;
            sk1.direction.y = bulletSpawnPoint.up.y;

            //Send skill1
            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(sk1)));
        }

    }

    // skill r phong day xich troi ke dich dau tien gap phai
    private void Skill2()
    {
        if (!ChatBoxInfor.IsTurnChatBox && Input.GetKeyDown(KeyCode.R))
        {
            //Define skill1
            sk1.activator = NetworkClient.ClientID;
            sk1.typeId = networkIdentity.TypeId;
            sk1.num = 2;
            sk1.position.x = bulletSpawnPoint.position.x.TwoDecimals();
            sk1.position.y = bulletSpawnPoint.position.y.TwoDecimals();
            sk1.direction.x = bulletSpawnPoint.up.x;
            sk1.direction.y = bulletSpawnPoint.up.y;

            //Send skill1
            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(sk1)));
        }

    }

    private void Skill3()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            sk1.activator = NetworkClient.ClientID;
            sk1.typeId = networkIdentity.TypeId;
            sk1.num = 3;

            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(sk1)));

        }
    }


    // skill space cuong hoa cong giap speep toc danh mau ao
}

