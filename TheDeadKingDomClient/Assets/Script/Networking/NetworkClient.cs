using System;
using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
using Cinemachine;

public class NetworkClient : SocketIOComponent
{

    public const float SERVER_UPDATE_TIME = 10;
    public static Dictionary<string, NetworkIdentity> serverObjects;
    public static string ClientID
    {
        get;
        private set;
    }
    public static string ClientName
    {
        get;
        set;
    }
    public static float MyTeam;

    [SerializeField]
    private ServerObjects serverSpawnables;

    [SerializeField]
    private GameObject healthComponent;
    [SerializeField]
    private Transform networkContainer;
    public static Action<SocketIOEvent> OnGameStateChange = (E) => { };
    public static Action<SocketIOEvent> OnChangeHero = (E) => { };
    public static Action<SocketIOEvent> OnUpdatePlayer = (E) => { };
    public static Action<SocketIOEvent> OnTimeUpdate = (E) => { };
    public static Action<SocketIOEvent> OnTimeSkillUpdate = (E) => { };
    public static Action<SocketIOEvent> OnKillDeadUpdate = (E) => { };
    public static Action<SocketIOEvent> OnResultMatch = (E) => { };
    public static Action<SocketIOEvent> OnChat = (E) => { };
    private string myMap = "";

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

            string id = E.data["id"].str;
            float team = E.data["team"].f;
            string tankId = E.data["tank"]["typeId"].str;
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
                ni.TypeId = tankId;
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
        On("deadPlayerReset", (E) =>
        {
            string id = E.data["id"].str;
            float speed = E.data["speed"].f;
            float attackSpeed = E.data["attackSpeed"].f;
            var ni = serverObjects[id];
            TankGeneral tg = ni.GetComponent<TankGeneral>();
            tg.Speed = speed;
            tg.AttackSpeed = attackSpeed;

        });


        On("skillEffectAnimation", (E) =>
        {
            string enemyId = E.data["enemyId"].str;  // 
            string efId = E.data["efId"].str;  //
            var ni = serverObjects[enemyId];
            var efAni = ni.GetComponent<EffectAnimation>();
            var niSkill = serverObjects[efId];
            Debug.Log("ani " + efId);
            efAni.SetEffectAnimation(efId, niSkill.GetComponent<EffectSkill>().Effect);
            bool remove = E.data["remove"].b;
            if (remove)
            {
                Destroy(niSkill.gameObject);

            }
            if (E.data["time"] != null)
            {
                float time = E.data["time"].f;
                StartCoroutine(RemoveEfAftertime(efAni, efId, time));
            }
        }); 
        
        
        On("itemEffectAnimation", (E) =>
        {
            string enemyId = E.data["enemyId"].str;  // 
            string efId = E.data["efId"].str;  //
            var ni = serverObjects[enemyId];
            var efAni = ni.GetComponent<EffectAnimation>();
            var niSkill = serverObjects[efId];
            Debug.Log("ani " + efId);
            efAni.SetEffectAnimation(efId, niSkill.GetComponent<EffectSkill>().Effect);
            bool remove = E.data["remove"].b;
            if (remove)
            {
                Destroy(niSkill.gameObject);
                serverObjects.Remove(efId);
            }
            if (E.data["time"] != null)
            {
                float time = E.data["time"].f;
                StartCoroutine(RemoveEfAftertime(efAni, efId, time));
            }
        });


        On("endEffectAnimation", (E) =>
        {
            Debug.Log("endEffectAnimation");
            string id = E.data["id"].str;  //
            var endEf = E.data["endEf"].list;  // 
            var ni = serverObjects[id];
            var efAni = ni.GetComponent<EffectAnimation>();
            endEf.ForEach(e =>
            {
                Debug.Log("remove " + e["id"].str);
                efAni.RemoveEffect(e["id"].str);
            });
        });


        On("changeAttackSpeed", (E) =>
        {
            string id = E.data["id"].str;
            float attackSpeed = E.data["attackSpeed"].f;
            var ni = serverObjects[id];
            var tg = ni.GetComponent<TankGeneral>();
            tg.AttackSpeed = attackSpeed;
            Debug.Log("Change attackSpeed " + attackSpeed);
        });

        On("removeAllEffect", (E) =>
        {
            string id = E.data["id"].str;
            var ni = serverObjects[id];
            var efAni = ni.GetComponent<EffectAnimation>();
            efAni.RemoveALlEf();
        });
        On("isTiedUp", (E) =>
        {
            string id = E.data["id"].str;
            bool tiedUp = E.data["tiedUp"].b;
            Debug.Log(id + " tiedUp " + tiedUp);
            var ni = serverObjects[id];
            var tg = ni.GetComponent<TankGeneral>();
            tg.TiedUp = tiedUp;
        });
        On("isStunned", (E) =>
        {
            string id = E.data["id"].str;
            bool stunned = E.data["stunned"].b;
            Debug.Log(id + " stunned " + stunned);
            var ni = serverObjects[id];
            var tg = ni.GetComponent<TankGeneral>();
            tg.Stunned = stunned;
        });
        On("changeSpeed", (E) =>
        {
            string id = E.data["id"].str;
            float speed = E.data["speed"].f;
            var ni = serverObjects[id];
            var tg = ni.GetComponent<TankGeneral>();
            tg.Speed = speed;
            Debug.Log("Change speed " + speed);
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

        On("receivedMessage", (E) =>
        {
            OnChat.Invoke(E);
        });

        On("updateTime", (E) =>
        {
            //      float time = E.data["matchTime"].f;
            OnTimeUpdate.Invoke(E);
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
                if (name == "Hp_Potion")
                {
                    float health = E.data["health"].f;
                    float team = E.data["team"].f;
                    ServerObjectData sod1 = serverSpawnables.GetObjectByName(name + "_" + team);
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
                if (name == "BuffItem")
                {
                    string type = E.data["type"].ToString().RemoveQuotes();
                    ServerObjectData sod1 = serverSpawnables.GetObjectByName(name + "_" + type);
                    GameObject spawnedObject1 = Instantiate(sod1.Prefab, networkContainer);
                    spawnedObject1.transform.position = new Vector3(x, y, 0);
                    NetworkIdentity ni1 = spawnedObject1.GetComponent<NetworkIdentity>();
                    ni1.SetControllerId(id);
                    ni1.SetSocketReference(this);
                    ni1.TypeId = type;
                    serverObjects.Add(id, ni1);
                }
                if (name == "Box")
                {
                    float health = E.data["health"].f;
                    string type = E.data["type"].ToString().RemoveQuotes();
                    ServerObjectData sod1 = serverSpawnables.GetObjectByName(name + "_" + type);
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

                    healthBar.SetHealth(health);
                    healthBar.SetMaxHealth(health);

                    healthBar.setMyGamTransform(spawnedObject1.transform);
                    h.name = $"Health : {id}";
                    ni1.setHealthBar(healthBar);
                }
                if (name == "Helipad")
                {
                    ServerObjectData sod1 = serverSpawnables.GetObjectByName(name);
                    GameObject spawnedObject1 = Instantiate(sod1.Prefab, networkContainer);
                    spawnedObject1.transform.position = new Vector3(x, y, 0);
                    NetworkIdentity ni1 = spawnedObject1.GetComponent<NetworkIdentity>();
                    ni1.SetControllerId(id);
                    ni1.SetSocketReference(this);
                    serverObjects.Add(id, ni1);
                }
            }
        });

        // player and ai response
        On("skillSpawn", (E) =>
        {
            string name = E.data["name"].str;
            string id = E.data["id"].str;
            var num = E.data["num"].f;
            var typeId = E.data["typeId"].str;
            Debug.LogFormat($"Server wants us to spawn a '{name}' ${num} ${typeId}");
            if (name == "OrientationSkill")
            {
                float x = E.data["position"]["x"].f;
                float y = E.data["position"]["y"].f;
                float directionX = E.data["direction"]["x"].f;
                float directionY = E.data["direction"]["y"].f;
                string activator = E.data["activator"].str;
                float skillSpeed = E.data["skillSpeed"].f;

                var netIdenPlayer = serverObjects[activator];


                GameObject spawnedObject = null;
                NetworkIdentity ni = null;
                if (num == 1 && typeId == "001")
                {
                    spawnedObject = Instantiate(netIdenPlayer.GetSkill1(), networkContainer);
                    var skill1_001 = spawnedObject.GetComponent<Skill1_001>();
                    skill1_001.ActiveBy = activator;
                }
                if (num == 2 && typeId == "001")
                {
                    spawnedObject = Instantiate(netIdenPlayer.GetSkill2(), networkContainer);
                    var skill2_001 = spawnedObject.GetComponent<Skill2_001>();
                    skill2_001.ActiveBy = activator;
                }
                if (num == 1 && typeId == "002")
                {
                    spawnedObject = Instantiate(netIdenPlayer.GetSkill1(), networkContainer);
                    var skill = spawnedObject.GetComponent<Skill1_002>();
                    skill.ActiveBy = activator;
                }

                spawnedObject.transform.position = new Vector3(x, y, 0);
                ni = spawnedObject.GetComponent<NetworkIdentity>();
                ni.SetControllerId(id);

                ni.SetSocketReference(this);
                float rot = Mathf.Atan2(directionY, directionX) * Mathf.Rad2Deg;
                Vector3 currentRotation = new Vector3(0, 0, rot + 90);
                spawnedObject.transform.rotation = Quaternion.Euler(currentRotation);

                Projectile projectile = spawnedObject.GetComponent<Projectile>();
                projectile.Direction = new Vector2(directionX, directionY);
                projectile.Speed = skillSpeed;

                serverObjects.Add(id, ni);
            }

            if (name == "skillBuff")
            {

                var playerImpacted = E.data["playerImpacted"].list;
                playerImpacted.ForEach(playid =>
                {
                    var ni = serverObjects[playid.str];
                    if (typeId == "001" && num == 3)
                    {

                        var efAni = ni.GetComponent<EffectAnimation>();
                        efAni.SetEffectAnimation(id, ni.GetSkill3());
                    }
                    if (typeId == "003" && num == 1)
                    {
                        var tankSkill003 = ni.GetComponent<TankSkill003>();
                        tankSkill003.OnSkill1 = true;
                        var efAni = ni.GetComponent<EffectAnimation>();
                        efAni.SetEffectAnimation(id, ni.GetSkill1());

                    }

                });
            }
            if (name == "skillRegion")
            {
                string activator = E.data["activator"].str;
                var netIdenPlayer = serverObjects[activator];
                float x = E.data["position"]["x"].f;
                float y = E.data["position"]["y"].f;
                GameObject spawnedObject = null;
                NetworkIdentity ni = null;
                if (typeId == "002" && num == 3)
                {
                    spawnedObject = Instantiate(netIdenPlayer.GetSkill3(), networkContainer);
                    var skill = spawnedObject.GetComponent<Skill3_002>();
                    skill.ActiveBy = activator;
                }
                if (typeId == "002" && num == 2)
                {
                    spawnedObject = Instantiate(netIdenPlayer.GetSkill2(), networkContainer);
                    var skill = spawnedObject.GetComponent<Skill2_002>();
                    skill.ActiveBy = activator;
                }
                if (num == 2 && typeId == "003")
                {
                    float directionX = E.data["direction"]["x"].f;
                    float directionY = E.data["direction"]["y"].f;
                    spawnedObject = Instantiate(netIdenPlayer.GetSkill2(), networkContainer);
                    var skill = spawnedObject.GetComponent<Skill2_003>();
                    skill.ActiveBy = activator;
                    skill.Direction = new Position();
                    skill.Direction.x = directionX;
                    skill.Direction.y = directionY;
                    float rot = Mathf.Atan2(directionY, directionX) * Mathf.Rad2Deg;
                    Vector3 currentRotation = new Vector3(0, 0, rot + 90);
                    spawnedObject.transform.rotation = Quaternion.Euler(currentRotation);
                }
                spawnedObject.transform.position = new Vector3(x, y, 0);
                ni = spawnedObject.GetComponent<NetworkIdentity>();
                ni.SetControllerId(id);
                ni.SetSocketReference(this);

                Debug.Log("spawn skill " + id);

                serverObjects.Add(id, ni);

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
            if (ni.gameObject.tag != "HpBox")
                ni.getHealthBar()?.transform.parent.gameObject.SetActive(true);
            ni.getHealthBar().SetHealth(health);
        });
        On("stopLoading", (e) =>
        {
            string id = e.data.ToString().Replace("\"", "");
            var ni = serverObjects[id];
            Debug.Log("stop");
            ni.gameObject.transform.GetChild(0).gameObject.SetActive(false);
        });
        On("startLoadingCoolDown", (e) =>
        {
            string id = e.data.ToString().Replace("\"", "");
            var ni = serverObjects[id];
            Debug.Log("start");
            ni.gameObject.transform.GetChild(0).gameObject.SetActive(true);
        });

        // update kill
        On("killUpdate", (e) =>
        {
            OnKillDeadUpdate.Invoke(e);
        });

        //

        On("rsmatch", (e) =>
        {

            foreach (var keyValuePair in serverObjects)
            {
                if (keyValuePair.Value != null)
                {
                    Destroy(keyValuePair.Value.gameObject);
                }
            }
            serverObjects.Clear();
            foreach (Transform child in networkContainer)
            {
                GameObject.Destroy(child.gameObject);
            }

            SceneManagement.Instance.LoadLevel(SceneList.MATCHRS, (levelName) =>
            {
                OnResultMatch.Invoke(e);
                SceneManagement.Instance.UnLoadLevel(myMap);
            });

        });


        // unspawn bullet
        On("serverUnSpawn", (E) =>
        {
            string id = E.data["id"].ToString().RemoveQuotes();
            NetworkIdentity ni = serverObjects[id];
            serverObjects.Remove(id);
            DestroyImmediate(ni.gameObject);
        });
        // unspawn skill1
        On("severUnspawnSkill", (E) =>
        {
            string id = E.data["id"].str;
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
            StartCoroutine(AIPositionSmoothing(ni.transform, new Vector3(x, y, 0)));

            //   ni.transform.position = new Vector3(x, y, 0);
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

        On("boxDied", (e) =>
        {
            string id = e.data["id"].ToString().Replace("\"", "");
            var ni = serverObjects[id];
            if (ni.GetComponent<AiManager>())
            {
                ni.GetComponent<AiManager>().StopCoroutines();
            }
            DestroyImmediate(ni.getHealthBar().transform.parent.gameObject);
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

        On("loadWaiting", (E) =>
        {
            Debug.Log("Switching to waiting choose hero");
            SceneManagement.Instance.LoadLevel(SceneList.WAITING, (levelName) =>
           {
               OnUpdatePlayer.Invoke(E);
               FindObjectOfType<WaitingSceneManagement>().time = E.data["time"].f;
               SceneManagement.Instance.UnLoadLevel(SceneList.MAIN_MENU);
           });


        });

        On("loadGame", (E) =>
        {
            Debug.Log("Join game");
            string map = E.data["map"].str;
            myMap = map;
            SceneManagement.Instance.LoadLevel(map, (levelName) =>
            {
                SceneManagement.Instance.UnLoadLevel(SceneList.WAITING);
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
        On("updateTimeSkill", (E) =>
        {
            OnTimeSkillUpdate.Invoke(E);
        });


        On("updateHero", (e) =>
        {
            OnChangeHero.Invoke(e);
        });

        On("lobbyUpdate", (e) =>
        {
            Debug.Log("Lobby update " + e.data["state"].str);

            OnGameStateChange.Invoke(e);


        });
        On("unloadGame", (E) =>
        {
            ReturnToMainMenu();
        });
        On("errorPickTank", (E) =>
        {
            ReturnToMainMenuWithError("Error pick tank");
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
    public void OnQuit()
    {
        Emit("quitGame");
        ReturnToMainMenu();
    }

    private void ReturnToMainMenu()
    {
        foreach (var keyValuePair in serverObjects)
        {
            if (keyValuePair.Value != null)
            {
                Destroy(keyValuePair.Value.gameObject);
            }
        }
        serverObjects.Clear();
        foreach (Transform child in networkContainer)
        {
            GameObject.Destroy(child.gameObject);
        }
        SceneManagement.Instance.LoadLevel(SceneList.MAIN_MENU, (levelName) =>
        {
            SceneManagement.Instance.UnLoadLevel(myMap);
            FindObjectOfType<MenuManager>().OnSignInComplete();
        });
    }

    private void ReturnToMainMenuWithError(string error)
    {
        foreach (var keyValuePair in serverObjects)
        {
            if (keyValuePair.Value != null)
            {
                Destroy(keyValuePair.Value.gameObject);
            }
        }
        serverObjects.Clear();
        foreach (Transform child in networkContainer)
        {
            GameObject.Destroy(child.gameObject);
        }
        SceneManagement.Instance.LoadLevel(SceneList.MAIN_MENU, (levelName) =>
        {
            SceneManagement.Instance.UnLoadLevel(myMap);
            FindObjectOfType<MenuManager>().OnSignInComplete();
            FindObjectOfType<MenuManager>().message.text = error;
        });
    }

    private IEnumerator RemoveEfAftertime(EffectAnimation efAni, string id, float t)
    {
        yield return new WaitForSeconds(t);
        efAni.RemoveEffect(id);
    }
}
