using UnityEngine;
using System.Collections;

public class Skill2_002 : MonoBehaviour
{
    private string activeBy;
    [SerializeField]
    private NetworkIdentity networkIdentity;


    public string ActiveBy { get => activeBy; set => activeBy = value; }


    private void OnCollisionEnter2D(Collision2D collision)
    {
        var niActive = NetworkClient.serverObjects[activeBy];
        NetworkIdentity ni = collision?.gameObject?.GetComponent<NetworkIdentity>();

        // client trung dan gui request
        if (niActive.IsControlling() && ni.GetComponent<TankGeneral>() != null)
        {
            Debug.Log("touch " + ni.GetId());

            networkIdentity.GetSocket().Emit("touchSkill", new JSONObject(JsonUtility.ToJson(new TouchData()
            {
                id = networkIdentity.GetId(),
                num = 2,
                typeId = "002",
                enemyId = ni.GetId(),
                typeEnemy = "Player",

            })));


            return;
        }

    }

    private void OnCollisionExit2D(Collision2D collision)
    {


        var niActive = NetworkClient.serverObjects[activeBy];
        NetworkIdentity ni = collision?.gameObject?.GetComponent<NetworkIdentity>();
        if (ni.IsControlling())
        {
            Debug.Log("exit " + ni.GetId());
            networkIdentity.GetSocket().Emit("exitSkill", new JSONObject(JsonUtility.ToJson(new TouchData()
            {
                id = networkIdentity.GetId(),
                num = 2,
                typeId = "002",
                enemyId = ni.GetId(),
                typeEnemy = "Player",

            })));


            return;
        }
    }
    private void OnDestroy()
    {
        var ni = NetworkClient.serverObjects[NetworkClient.ClientID];
        Debug.Log("exit " + ni.GetId());

        networkIdentity.GetSocket().Emit("exitSkill", new JSONObject(JsonUtility.ToJson(new TouchData()
        {
            id = networkIdentity.GetId(),
            num = 2,
            typeId = "002",
            enemyId = ni.GetId(),
            typeEnemy = "Player",

        })));


        return;

    }
}
