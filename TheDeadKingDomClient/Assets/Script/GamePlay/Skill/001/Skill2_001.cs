using UnityEngine;
using System.Collections;

public class Skill2_001 : MonoBehaviour
{
    private string activeBy;
    [SerializeField]
    private NetworkIdentity networkIdentity;


    public string ActiveBy { get => activeBy; set => activeBy = value; }

    private void OnCollisionEnter2D(Collision2D collision)
    {
        var niActive = NetworkClient.serverObjects[activeBy];
        NetworkIdentity ni = collision?.gameObject?.GetComponent<NetworkIdentity>();

        // cham nhau
        if (ni.tag == "BulletThrough")
        {
            return;
        }

        // ko phai cham chinh minh


        if (ni.GetId() != activeBy)
        {
            if (ni.Team == niActive.Team)
            {
                return;
            }

            // client trung dan gui request
            if (niActive.IsControlling() && ni.GetComponent<TankGeneral>() != null)
            {
                gameObject.SetActive(false);
                networkIdentity.GetSocket().Emit("touchSkill", new JSONObject(JsonUtility.ToJson(new TouchData()
                {
                    id = networkIdentity.GetId(),
                    num = 2,
                    typeId = "001",
                    enemyId = ni.GetId(),
                    typeEnemy = "Player",

                })));


                return;
            }
            //  ai trung dan , firer gui request

            if (niActive.IsControlling() && ni.GetComponent<AiManager>() != null)
            {

                gameObject.SetActive(false);
                networkIdentity.GetSocket().Emit("touchSkill", new JSONObject(JsonUtility.ToJson(new TouchData()
                {
                    id = networkIdentity.GetId(),
                    num = 2,
                    typeId = "001",
                    enemyId = ni.GetId(),
                    typeEnemy = "AI",
                })));
                return;
            }

        }

    }
}
