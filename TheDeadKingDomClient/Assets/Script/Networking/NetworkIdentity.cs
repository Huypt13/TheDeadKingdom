using System;
using SocketIO;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// controll each charactor
public class NetworkIdentity : MonoBehaviour
{
    private string id;
    private float team;
    private bool isControlling;
    private SocketIOComponent socket;
    private HealthBar healthBar;

    [SerializeField]
    private GameObject bullet;
    [SerializeField]
    private GameObject effectZone;
    [SerializeField]
    private GameObject skill1;
    [SerializeField]
    private GameObject skill2;
    [SerializeField]
    private GameObject skill3;

    [SerializeField]
    private GameObject flash;
    private string typeId;
    public float Team { get => team; set => team = value; }
    public string TypeId { get => typeId; set => typeId = value; }

    // private HealthBar healthBar;
    private void Awake()
    {
        isControlling = false;
    }


    public void SetControllerId(String Id)
    {
        id = Id;
        isControlling = (NetworkClient.ClientID == Id) ? true : false;
    }
    public void setHealthBar(HealthBar health)
    {
        healthBar = health;
    }
    public HealthBar getHealthBar()
    {
        return healthBar;
    }
    public void SetSocketReference(SocketIOComponent Socket)
    {
        socket = Socket;
    }
    public string GetId()
    {
        return id;
    }
    public GameObject GetFlash()
    {
        return flash;
    }
    public GameObject GetBullet()
    {
        return bullet;
    }
    public GameObject GetSkill1()
    {
        return skill1;
    }
    public GameObject GetSkill2()
    {
        return skill2;
    }
    public GameObject GetSkill3()
    {
        return skill3;
    }

    public GameObject GetEffectZone()
    {
        return effectZone;
    }
    public bool IsControlling()
    {
        return isControlling;
    }
    public SocketIOComponent GetSocket()
    {
        return socket;
    }
}