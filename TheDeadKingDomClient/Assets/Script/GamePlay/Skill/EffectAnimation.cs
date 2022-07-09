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
        if (efAni != null)
        {
            Destroy(efAni.gameObject);
        }
    }

}
