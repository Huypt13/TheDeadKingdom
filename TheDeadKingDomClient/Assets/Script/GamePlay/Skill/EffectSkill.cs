using UnityEngine;
using System.Collections;

public class EffectSkill : MonoBehaviour
{
    [SerializeField]
    private GameObject effect;

    public GameObject Effect { get => effect; set => effect = value; }
}
