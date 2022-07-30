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
        Debug.Log("remove");
        var ni = GetComponent<NetworkIdentity>();
        var efAni = ni.GetEffectZone().transform.Find(efId);
        if (efAni != null)
        {
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
