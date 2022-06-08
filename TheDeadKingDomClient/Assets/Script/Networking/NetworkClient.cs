using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;

public class NetworkClient : SocketIOComponent
{
    public static Dictionary<string, NetworkIdentity> serverObject;
    public static string ClientID
    {
        get;
        private set;
    }

    public override void Start()
    {
        base.Start();
        setupEvents();
        serverObject = new Dictionary<string, NetworkIdentity>();
    }

    // Update is called once per frame
    public override void Update()
    {
        base.Update();
    }

    private void setupEvents()
    {
        On("open", (E) =>
        {
            Debug.Log("Connection made to the server");
        });
        On("register", (E) =>
        {
            Debug.Log("aaa");

            ClientID = E.data["id"].ToString().RemoveQuotes();
            Debug.LogFormat("Our Client's ID ({0})", ClientID);

        });
    }
}
