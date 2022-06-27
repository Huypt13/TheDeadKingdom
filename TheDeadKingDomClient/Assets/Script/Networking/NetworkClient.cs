using SocketIO;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Defines the <see cref="NetworkClient" />.
/// </summary>
public class NetworkClient : SocketIOComponent
{
    /// <summary>
    /// Defines the SERVER_UPDATE_TIME.
    /// </summary>
    public const float SERVER_UPDATE_TIME = 10;

    /// <summary>
    /// Defines the serverObjects.
    /// </summary>
    public static Dictionary<string, NetworkIdentity> serverObjects;

    /// <summary>
    /// Gets the ClientID.
    /// </summary>
    public static string ClientID { get; private set; }

    /// <summary>
    /// Defines the serverSpawnables.
    /// </summary>
    [SerializeField]
    private ServerObjects serverSpawnables;

    /// <summary>
    /// Defines the healthComponent.
    /// </summary>
    [SerializeField]
    private GameObject healthComponent;

    /// <summary>
    /// Defines the networkContainer.
    /// </summary>
    [SerializeField]
    private Transform networkContainer;

    /// <summary>
    /// Defines the onGameStateChange.
    /// </summary>
    public static Action<SocketIOEvent> onGameStateChange = (E) => { };

    /// <summary>
    /// The Start.
    /// </summary>
    public override void Start()
    {
        base.Start();
        setupEvents();
        serverObjects = new Dictionary<string, NetworkIdentity>();
    }

    // Update is called once per frame
    /// <summary>
    /// The Update.
    /// </summary>
    public override void Update()
    {
        base.Update();
    }

    /// <summary>
    /// The setupEvents.
    /// </summary>
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

            string id = E.data["id"].str;
            float team = E.data["team"].f;
            string tankId = E.data["tank"]["id"].str;
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
                ni.Team = team;
                ni.SetControllerId(id);
                ni.SetSocketReference(this);
                TankGeneral tg = go.GetComponent<TankGeneral>();
                tg.SetInitValue(speed, rotation, attackSpeed, health);
                serverObjects.Add(id, ni);

                GameObject h = Instantiate(healthComponent, networkContainer);
                var healthBar = h.transform.GetComponentInChildren<HealthBar>();
                if (ClientID == id)
                {
                    healthBar.setIsMyHealth(true);
                }

                healthBar.team = team;
                healthBar.SetHealth(health);
                healthBar.SetMaxHealth(health);

                healthBar.setMyGamTransform(go.transform);
                h.name = $"Health : {id}";
                ni.setHealthBar(healthBar);

            }
        });

        // update healthAI
        On("updateHealthAI", (E) =>
        {
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
                if (name == "AI_Tank" || name == "AI_TOWER")
                {
                    string aiId = E.data["aiId"].str;
                    float team = E.data["team"].f;

                    float health = E.data["health"].f;
                    ServerObjectData sod = serverSpawnables.GetObjectByName($"{name}_{aiId}");
                    GameObject spawnedObject = Instantiate(sod.Prefab, networkContainer);
                    spawnedObject.name = $"{name}: " + id + " - type: " + aiId;
                    spawnedObject.transform.position = new Vector3(x, y, 0);
                    NetworkIdentity ni = spawnedObject.GetComponent<NetworkIdentity>();
                    ni.Team = team;
                    ni.SetControllerId(id);
                    ni.SetSocketReference(this);
                    serverObjects.Add(id, ni);


                    GameObject h = Instantiate(healthComponent, networkContainer);
                    var healthBar = h.transform.GetComponentInChildren<HealthBar>();
                    healthBar.setIsMyHealth(false);
                    healthBar.team = team;
                    healthBar.SetMaxHealth(health);
                    healthBar.setMyGamTransform(spawnedObject.transform);
                    h.name = $"Health : {id}";
                    ni.setHealthBar(healthBar);
                }
                if(name == "Hp_Potion" || name == "Hp_Potion2")
                {
                    float health = E.data["health"].f;
                    float team = E.data["team"].f;
                    ServerObjectData sod1 = serverSpawnables.GetObjectByName(name);
                    GameObject spawnedObject1 = Instantiate(sod1.Prefab, networkContainer);
                    spawnedObject1.transform.position = new Vector3(x, y, 0);
                    NetworkIdentity ni1 = spawnedObject1.GetComponent<NetworkIdentity>();
                    ni1.SetControllerId(id);
                    ni1.SetSocketReference(this);
                    serverObjects.Add(id, ni1);
                    GameObject h = Instantiate(healthComponent, spawnedObject1.transform);
                    h.SetActive(false);
                    var healthBar = h.transform.GetComponentInChildren<HealthBar>();
                    if (ClientID == id)
                    {
                        healthBar.setIsMyHealth(true);
                    }

                    healthBar.team = team;
                    healthBar.SetHealth(health);
                    healthBar.SetMaxHealth(health);

                    healthBar.setMyGamTransform(spawnedObject1.transform);
                    h.name = $"Health : {id}";
                    ni1.setHealthBar(healthBar);

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
            float health = e.data["health"].f;

            ni.transform.position = new Vector3(x, y, 0);
            ni.gameObject.SetActive(true);
            ni.getHealthBar().SetHealth(health);
            if(ni.gameObject.tag == "hpBox")
            ni.gameObject.transform.GetChild(1).gameObject.SetActive(false);
        });
        On("stopLoading", (e) =>
        {
            string id = e.data.ToString().Replace("\"", "");
            var ni = serverObjects[id];
            ni.gameObject.transform.GetChild(0).gameObject.SetActive(false);
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

            ni.getHealthBar()?.transform.parent.gameObject.SetActive(false);
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
        On("updateTower", (E) =>
        {

            string id = E.data["id"].ToString().Replace("\"", "");
            float barrelRotation = E.data["barrelRotation"].f;
            NetworkIdentity ni = serverObjects[id];
            //  ni.transform.position = new Vector3(x, y, 0);
            if (ni.gameObject.activeInHierarchy)
            {
                ni.GetComponent<AiManager>().SetBarrelRotation(barrelRotation + 180);
            }

        });



        On("lobbyUpdate", (e) =>
        {
            Debug.Log("Lobby update" + e.data["state"].str);
            onGameStateChange.Invoke(e);
        });
        On("HpHeal", (E) =>
        {
            string playerId = (E.data.str).RemoveQuotes();
            Transform effect = serverObjects[playerId].transform.Find("Immunity Area Effect");
            effect.gameObject.SetActive(true);
        });
        On("HpStopHeal", (E) =>
        {
            string playerId = (E.data.str).RemoveQuotes();
            Transform effect = serverObjects[playerId].transform.Find("Immunity Area Effect");
            effect.gameObject.SetActive(false);
        });

        On("disconnected", (E) =>
        {
            string id = E.data["id"].ToString().RemoveQuotes();

            GameObject go = serverObjects[id].gameObject;
            Destroy(go); //Remove from game
            serverObjects.Remove(id); //Remove from memory
        });
    }

    /// <summary>
    /// The AIPositionSmoothing.
    /// </summary>
    /// <param name="aiTransform">The aiTransform<see cref="Transform"/>.</param>
    /// <param name="goalPosition">The goalPosition<see cref="Vector3"/>.</param>
    /// <returns>The <see cref="IEnumerator"/>.</returns>
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
