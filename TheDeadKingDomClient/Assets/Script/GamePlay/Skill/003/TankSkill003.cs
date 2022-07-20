using UnityEngine;
using System.Collections;

public class TankSkill003 : MonoBehaviour
{

    [SerializeField]
    private Transform bulletSpawnPoint;

    [SerializeField]
    private NetworkIdentity networkIdentity;

    private bool onSkill1 = false;
    SkillOrientationData skdata;
    RegionSkill rData;

    SkillBuff bdata;

    public bool OnSkill1 { get => onSkill1; set => onSkill1 = value; }

    // Start is called before the first frame update
    void Start()
    {
        skdata = new SkillOrientationData();
        skdata.direction = new Position();
        skdata.position = new Position();

        rData = new RegionSkill();
        rData.position = new Position();

        bdata = new SkillBuff();
    }


    // Update is called once per frame
    void Update()
    {
        if (networkIdentity.IsControlling())
        {
            var tankGen = networkIdentity.GetComponent<TankGeneral>();
            if (!tankGen.Stunned)
            {
                Skill1();
                Skill2();
            }
            Skill3();
        }
    }


    // skill e phong 1 luong nang luong lam cham ke dich tren duong di
    private void Skill1()
    {
        if (Input.GetKeyDown(KeyCode.E))
        {
            //Define skill1
            skdata.activator = NetworkClient.ClientID;
            skdata.enemyId = NetworkClient.ClientID;
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
        if (Input.GetKeyDown(KeyCode.R))
        {
            skdata.activator = NetworkClient.ClientID;
            skdata.enemyId = NetworkClient.ClientID;
            skdata.num = 2;
            skdata.typeId = networkIdentity.TypeId;
            skdata.position.x = bulletSpawnPoint.position.x.TwoDecimals();
            skdata.position.y = bulletSpawnPoint.position.y.TwoDecimals();
            skdata.direction.x = bulletSpawnPoint.up.x;
            skdata.direction.y = bulletSpawnPoint.up.y;

            //Send skill1
            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(skdata)));
        }

    }

    private void Skill3()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            Vector3 mousePosition = Camera.main.ScreenToWorldPoint(Input.mousePosition);

            rData.activator = NetworkClient.ClientID;
            rData.num = 3;
            rData.typeId = networkIdentity.TypeId;
            rData.position.x = mousePosition.x.TwoDecimals();
            rData.position.y = mousePosition.y.TwoDecimals();

            //Send skill1
            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(rData)));
        }
    }
}
