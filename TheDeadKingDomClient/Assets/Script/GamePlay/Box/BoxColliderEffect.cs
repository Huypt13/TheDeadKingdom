using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

public class BoxColliderEffect : MonoBehaviour
{
    public void OnCollisionEnter2D(Collision2D collision)
    {
        NetworkIdentity ni = collision.gameObject.GetComponent<NetworkIdentity>();
        if (ni == null) return;
        NetworkIdentity potionNi = GetComponent<NetworkIdentity>();
        NetworkIdentity niActive;
        WhoActivatedMe whoActivatedMe = ni.GetComponent<WhoActivatedMe>();
        if (whoActivatedMe)
        {
            niActive = NetworkClient.serverObjects[whoActivatedMe.GetActivator()];
            if (niActive.Team == potionNi.Team) return;
        }
     
        if (ni.GetComponent<WhoActivatedMe>() == null && ni.IsControlling())
        {
            ni.GetSocket().Emit("onCollisionHealHpEffects", new JSONObject(JsonUtility.ToJson(new Potion()
            {
                id = GetComponent<NetworkIdentity>().GetId()
            }
        )));
        }
        if (ni.GetComponent<WhoActivatedMe>() != null)
        {
            GameObject HealthBar = transform.Find("Health : " + potionNi.GetId())?.gameObject;
            if (!HealthBar) return;
            HealthBar.SetActive(true);
            StartCoroutine(DoEvent());

        }

    }
    public IEnumerator DoEvent()
    {
        yield return new WaitForSecondsRealtime(2);
        NetworkIdentity potionNi = GetComponent<NetworkIdentity>();
        GameObject HealthBar = transform.Find("Health : " + potionNi.GetId())?.gameObject;
        if (HealthBar)
            HealthBar.SetActive(false);

    }



}
