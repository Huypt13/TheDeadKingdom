using System;
using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;

public class NetworkClient : SocketIOComponent
{
    public const float SERVER_UPDATE_TIME = 10;
    public static Dictionary<string, NetworkIdentity> serverObjects;
    public static string ClientID
    {
        get;
        private set;
    }

    [SerializeField]
    private ServerObjects serverSpawnables;

    [SerializeField]
    private GameObject healthComponent;
    [SerializeField]
    private Transform networkContainer;
    public static Action<SocketIOEvent> onGameStateChange = (E) => { };

    public override void Start()
    {
        base.Start();
        setupEvents();
        serverObjects = new Dictionary<string, NetworkIdentity>();
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


            ClientID = E.data["id"].ToString().RemoveQuotes();
            Debug.LogFormat("Our Client's ID ({0})", ClientID);

        });


        // spawn player
        On("spawn", (E) =>
        {
            //Handling all spawning all players
            //Passed Data

            string id = E.data["id"].ToString().RemoveQuotes();
            string tankId = E.data["tank"]["id"].str.RemoveQuotes();
            float tankLevel = E.data["tank"]["level"].f;
            float health = E.data["tank"]["health"].f;
            float speed = E.data["tank"]["speed"].f;
            float attackSpeed = E.data["tank"]["attackSpeed"].f;
            float rotation = E.data["tank"]["rotationSpeed"].f;
            float x = E.data["position"]["x"].f;
            float y = E.data["position"]["y"].f;

            Debug.Log($"Player {id} : Tank_{tankId}_{tankLevel} join game");
            if (!serverObjects.ContainsKey(id))
            {
                GameObject go = Instantiate(serverSpawnables.GetObjectByName($"Tank_{tankId}_{tankLevel}").Prefab, networkContainer);
                go.name = string.Format("Player ({0})", id);
                go.transform.position = new Vector3(x, y, 0);
                NetworkIdentity ni = go.GetComponent<NetworkIdentity>();
                ni.SetControllerId(id);
                ni.SetSocketReference(this);
                TankGeneral tg = go.GetComponent<TankGeneral>();
                tg.SetInitValue(speed, rotation, attackSpeed, health);
                serverObjects.Add(id, ni);

                GameObject h = Instantiate(healthComponent, networkContainer);
                var healthBar = h.transform.GetComponentInChildren<HealthBar>();
                healthBar.SetHealth(health);
                healthBar.SetMaxHealth(health);
                healthBar.setIsMyHealth(true);
                healthBar.setMyGamTransform(go.transform);
                if (id == ClientID)
                {
                    healthBar.fill.color = new Color(51, 196, 56);
                }
                h.name = $"Health : {id}";
                ni.setHealthBar(healthBar);

            }
        });

        // update healthAI
        On("updateHealthAI", (E) =>
        {
            Debug.Log("hoi mau");
            string id = E.data["id"].ToString().Replace("\"", "");
            float health = E.data["health"].f;
            var ni = serverObjects[id];
            //   ni.gameObject.SetActive(false);

            var healthBar = ni.getHealthBar();
            healthBar.SetHealth(health);

        });

        // spawn bullet
        On("serverSpawn", (E) =>
        {
            string name = E.data["name"].str;
            string id = E.data["id"].ToString().RemoveQuotes();
            float x = E.data["position"]["x"].f;
            float y = E.data["position"]["y"].f;
            Debug.LogFormat($"Server wants us to spawn a '{name}'");

            if (!serverObjects.ContainsKey(id))
            {
                //If bullet apply direction as well
                if (name == "Bullet")
                {
                    float directionX = E.data["direction"]["x"].f;
                    float directionY = E.data["direction"]["y"].f;
                    string activator = E.data["activator"].ToString().RemoveQuotes();
                    float bulletSpeed = E.data["bulletSpeed"].f;

                    var netIdenPlayer = serverObjects[activator];
                    var spawnedObject = Instantiate(netIdenPlayer.GetBullet(), networkContainer);
                    spawnedObject.transform.position = new Vector3(x, y, 0);


                    var ni = spawnedObject.GetComponent<NetworkIdentity>();
                    ni.SetControllerId(id);
                    ni.SetSocketReference(this);

                    float rot = Mathf.Atan2(directionY, directionX) * Mathf.Rad2Deg;
                    Vector3 currentRotation = new Vector3(0, 0, rot + 90);
                    spawnedObject.transform.rotation = Quaternion.Euler(currentRotation);

                    WhoActivatedMe whoActivatedMe = spawnedObject.GetComponent<WhoActivatedMe>();
                    whoActivatedMe.SetActivator(activator);

                    Projectile projectile = spawnedObject.GetComponent<Projectile>();
                    projectile.Direction = new Vector2(directionX, directionY);
                    projectile.Speed = bulletSpeed;

                    serverObjects.Add(id, ni);
                }
                if (name == "AI_Tank")
                {
                    string aiId = E.data["aiId"].str;

                    ServerObjectData sod = serverSpawnables.GetObjectByName($"AI_{aiId}");
                    GameObject spawnedObject = Instantiate(sod.Prefab, networkContainer);
                    spawnedObject.name = "boss: " + id + " - type: " + aiId;
                    spawnedObject.transform.position = new Vector3(x, y, 0);
                    NetworkIdentity ni = spawnedObject.GetComponent<NetworkIdentity>();
                    ni.SetControllerId(id);
                    ni.SetSocketReference(this);
                    serverObjects.Add(id, ni);


                    GameObject h = Instantiate(healthComponent, networkContainer);
                    var healthBar = h.transform.GetComponentInChildren<HealthBar>();

                    healthBar.SetMaxHealth(100);
                    healthBar.setIsMyHealth(false);
                    healthBar.setMyGamTransform(spawnedObject.transform);
                    h.name = $"Health : {id}";
                    ni.setHealthBar(healthBar);
                }


            }
        });




        // player and ai response

        On("playerRespawn", (e) =>
        {
            string id = e.data["id"].ToString().Replace("\"", "");
            var ni = serverObjects[id];
            float x = e.data["position"]["x"].f;
            float y = e.data["position"]["y"].f;
            ni.transform.position = new Vector3(x, y, 0);
            ni.gameObject.SetActive(true);
            ni.getHealthBar().SetHealth(100);
            ni.getHealthBar().transform.parent.gameObject.SetActive(true);
        });


        // unspawn bullet
        On("serverUnSpawn", (E) =>
        {
            string id = E.data["id"].ToString().RemoveQuotes();
            NetworkIdentity ni = serverObjects[id];
            serverObjects.Remove(id);
            DestroyImmediate(ni.gameObject);
        });


        // update pos player
        On("updatePosition", (E) =>
        {
            string id = E.data["id"].ToString().RemoveQuotes();
            float x = E.data["position"]["x"].f;
            float y = E.data["position"]["y"].f;

            NetworkIdentity ni = serverObjects[id];
            ni.transform.position = new Vector3(x, y, 0);
        });

        // update player rotation
        On("updateRotation", (E) =>
        {
            string id = E.data["id"].ToString().RemoveQuotes();
            float tankRotation = E.data["tankRotation"].f;
            float barrelRotation = E.data["barrelRotation"].f;

            NetworkIdentity ni = serverObjects[id];
            ni.transform.localEulerAngles = new Vector3(0, 0, tankRotation);
            ni.GetComponent<TankGeneral>().SetRotation(barrelRotation);
        });


        // update player died
        On("playerDied", (e) =>
        {
            string id = e.data["id"].ToString().Replace("\"", "");
            var ni = serverObjects[id];
            if (ni.GetComponent<AiManager>())
            {
                ni.GetComponent<AiManager>().StopCoroutines();
            }

            ni.getHealthBar().transform.parent.gameObject.SetActive(false);
            ni.gameObject.SetActive(false);
        });


        // update player attacked

        On("playerAttacked", (e) =>
        {
            string id = e.data["id"].ToString().Replace("\"", "");
            float health = e.data["health"].f;
            var ni = serverObjects[id];
            //   ni.gameObject.SetActive(false);

            var healthBar = ni.getHealthBar();
            healthBar.SetHealth(health);

        });

        On("loadGame", (E) =>
        {
            Debug.Log("Switching to game");
            SceneManagement.Instance.LoadLevel(SceneList.LEVEL, (levelName) =>
            {
                SceneManagement.Instance.UnLoadLevel(SceneList.MAIN_MENU);
            });
        });


        // update ai pos and rotation
        On("updateAI", (E) =>
        {
            string id = E.data["id"].ToString().Replace("\"", "");
            float x = E.data["position"]["x"].f;
            float y = E.data["position"]["y"].f;
            float tankRotation = E.data["tankRotation"].f;
            float barrelRotation = E.data["barrelRotation"].f;

            NetworkIdentity ni = serverObjects[id];
            //  ni.transform.position = new Vector3(x, y, 0);
            StartCoroutine(AIPositionSmoothing(ni.transform, new Vector3(x, y, 0)));
            if (ni.gameObject.activeInHierarchy)
            {
                ni.GetComponent<AiManager>().SetTankRotation(tankRotation);
                ni.GetComponent<AiManager>().SetBarrelRotation(barrelRotation + 180);
            }

        });


        On("lobbyUpdate", (e) =>
        {
            Debug.Log("Lobby update" + e.data["state"].str);
            onGameStateChange.Invoke(e);
        });

        On("disconnected", (E) =>
        {
            string id = E.data["id"].ToString().RemoveQuotes();

            GameObject go = serverObjects[id].gameObject;
            Destroy(go); //Remove from game
            serverObjects.Remove(id); //Remove from memory
        });
    }


    private IEnumerator AIPositionSmoothing(Transform aiTransform, Vector3 goalPosition)
    {
        float count = 0.1f; //In sync with server update
        float currentTime = 0.0f;
        Vector3 startPosition = aiTransform.position;

        while (currentTime < count)
        {
            currentTime += Time.deltaTime;

            if (currentTime < count)
            {
                aiTransform.position = Vector3.Lerp(startPosition, goalPosition, currentTime / count);
            }

            yield return new WaitForEndOfFrame();

            if (aiTransform == null)
            {
                currentTime = count;
                yield return null;
            }
        }

        yield return null;
    }

}
