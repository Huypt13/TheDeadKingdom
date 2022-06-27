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
    GameObject bullet;

    public float Team { get => team; set => team = value; }

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
    public GameObject GetBullet()
    {
        return bullet;
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