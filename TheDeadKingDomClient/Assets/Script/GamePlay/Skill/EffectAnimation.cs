using UnityEngine;
using System.Collections;

public class EffectAnimation : MonoBehaviour
{



    public void SetEffectAnimation(string efId, GameObject skillEffect)
    {
        Debug.Log("ef animation");
        var ni = GetComponent<NetworkIdentity>();
        GameObject ef = Instantiate(skillEffect, ni.GetEffectZone().transform);
        ef.name = efId;
    }


    public void RemoveEffect(string efId)
    {

        var ni = GetComponent<NetworkIdentity>();
        var efAni = ni.GetEffectZone().transform.Find(efId);
        Debug.Log("remove " + efAni.name);

        if (efAni != null)
        {
            if (efAni.tag == "EfDestroy")
            {
                var ani = efAni.GetComponent<Animator>();
                ani.SetBool("isDestroy", true);
                Destroy(efAni.gameObject, 0.3f);

            }
            else
                Destroy(efAni.gameObject);
        }
    }

    public void RemoveALlEf()
    {
        var ni = GetComponent<NetworkIdentity>();

        foreach (Transform child in ni.GetEffectZone().transform)
        {
            GameObject.Destroy(child.gameObject);
        }
    }

}
