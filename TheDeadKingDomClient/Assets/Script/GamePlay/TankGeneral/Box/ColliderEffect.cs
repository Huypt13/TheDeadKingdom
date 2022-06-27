using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

public class ColliderEffect : MonoBehaviour
{
    public void OnCollisionEnter2D(Collision2D collision)
    {
        NetworkIdentity ni = collision.gameObject.GetComponent<NetworkIdentity>();
        string targetName = collision.gameObject.name;
        string target = targetName.Substring(0, 6);
        if (target != "Bullet" && ni.IsControlling())
        {
            transform.GetChild(0).gameObject.SetActive(true);
            //transform.gameObject.SetActive(false);
            ni.GetSocket().Emit("onCollisionHealHpEffects", new JSONObject(JsonUtility.ToJson(new Potion()
            {

                id = GetComponent<NetworkIdentity>().GetId()
            }
        )));
        }
        if (target == "Bullet")
        {
            transform.GetChild(1).gameObject.SetActive(true);
            StartCoroutine(DoEvent());

        }

    }
    public IEnumerator DoEvent()
    {
        yield return new WaitForSecondsRealtime(2);
        transform.GetChild(1).gameObject.SetActive(false);

    }


  
}
