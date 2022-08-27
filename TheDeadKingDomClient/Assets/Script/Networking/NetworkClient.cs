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
    public static string curState;

    [SerializeField]
    private ServerObjects serverSpawnables;

    [SerializeField]
    private GameObject healthComponent;

    [SerializeField]
    private GameObject prefabFlagHealthBar;

    [SerializeField]
    private Transform networkContainer;
    public static Action<SocketIOEvent> OnGameStateChange = (E) => { };
    public static Action<SocketIOEvent> OnChangeHero = (E) => { };
    public static Action<SocketIOEvent> OnUpdatePlayer = (E) => { };
    public static Action<SocketIOEvent> OnTimeUpdate = (E) => { };
    public static Action<SocketIOEvent> OnTimeSkillUpdate = (E) => { };
    public static Action<SocketIOEvent> OnTimeSkillUpdate2 = (E) => { };
    public static Action<SocketIOEvent> OnKillDeadUpdate = (E) => { };
    public static Action<SocketIOEvent> OnResultMatch = (E) => { };
    public static Action<SocketIOEvent> OnChat = (E) => { };
    public static Action<SocketIOEvent> OnStartChat = (E) => { };
    public static Action<SocketIOEvent> OnSpawnMyTank = (E) => { };
    public static Action<float> OnPlayerDied = (time) => { };
    public static Action OnPlayerRespawn = () => { };
    public static Action<string, string, float> OnLoadGameMode = (gameMode, map, maxTime) => { };

    public static Action<SocketIOEvent> OnUpdatePosition = (E) => { };

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
            float health = E.data["health"].f;
            float maxHealth = E.data["maxHealth"].f;
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
                    OnSpawnMyTank.Invoke(E);
                }

                healthBar.team = team;
                healthBar.SetMaxHealth(maxHealth);
                healthBar.SetHealth(health);

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
            tg.Stunned = false;
            tg.TiedUp = false;
            tg.IsAutoMove = false;

            var ntr = ni.GetComponent<NetworkTransform>();
            ntr.IsFocusOn = false;
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
                    if (ClientID == activator)
                    {
                        AudioManager.Instance.PlayEffectSoundOneShot("shootingSound");
                    }
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
                    float maxHealth = E.data["maxHealth"].f;
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
                    healthBar.SetMaxHealth(maxHealth);
                    healthBar.SetHealth(health);
                    healthBar.setMyGamTransform(spawnedObject.transform);
                    h.name = $"Health : {id}";
                    ni.setHealthBar(healthBar);
                }
                if (name == "Hp_Potion")
                {
                    float health = E.data["health"].f;
                    float maxHealth = E.data["maxHealth"].f;

                    float team = E.data["team"].f;
                    ServerObjectData sod1 = serverSpawnables.GetObjectByName(name + "_" + team);
                    GameObject spawnedObject1 = Instantiate(sod1.Prefab, networkContainer);
                    spawnedObject1.transform.position = new Vector3(x, y, 0);
                    NetworkIdentity ni1 = spawnedObject1.GetComponent<NetworkIdentity>();
                    ni1.Team = team;
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

                    healthBar.SetMaxHealth(health);
                    healthBar.SetHealth(health);

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
                    float maxHealth = E.data["maxHealth"].f;
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


                    healthBar.SetMaxHealth(maxHealth);
                    healthBar.SetHealth(health);

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
                if (name == "MainHouse")
                {
                    float health = E.data["health"].f;
                    float team = E.data["team"].f;
                    float maxHealth = E.data["maxHealth"].f;

                    ServerObjectData sod1 = serverSpawnables.GetObjectByName(name + "_" + team);
                    GameObject spawnedObject1 = Instantiate(sod1.Prefab, networkContainer);
                    spawnedObject1.transform.position = new Vector3(x, y, 0);
                    NetworkIdentity ni1 = spawnedObject1.GetComponent<NetworkIdentity>();
                    ni1.SetControllerId(id);
                    ni1.SetSocketReference(this);
                    serverObjects.Add(id, ni1);
                    GameObject h = Instantiate(healthComponent, networkContainer);
                    h.SetActive(true);
                    var healthBar = h.transform.GetComponentInChildren<HealthBar>();

                    healthBar.team = team;

                    healthBar.SetMaxHealth(maxHealth);
                    healthBar.SetHealth(health);
                    healthBar.setMyGamTransform(spawnedObject1.transform);
                    h.name = $"Health : {id}";
                    ni1.setHealthBar(healthBar);
                }
                if (name == "Flag")
                {
                    float maxPoint = E.data["maxPoint"].f;
                    float point = E.data["point"].f;
                    float team = E.data["team"].f;
                    ServerObjectData sod1 = serverSpawnables.GetObjectByName(name);
                    GameObject spawnedObject1 = Instantiate(sod1.Prefab, networkContainer);
                    spawnedObject1.transform.position = new Vector3(x, y, 0);
                    NetworkIdentity ni1 = spawnedObject1.GetComponent<NetworkIdentity>();
                    ni1.SetControllerId(id);
                    ni1.SetSocketReference(this);
                    serverObjects.Add(id, ni1);
                    GameObject h = Instantiate(prefabFlagHealthBar, networkContainer);
                    h.SetActive(true);
                    var healthBar = h.transform.GetComponentInChildren<HealthBar>();
                    if (ClientID == id)
                    {
                        healthBar.setIsMyHealth(true);
                    }

                    healthBar.team = team;
                    healthBar.SetMaxHealth(maxPoint);
                    healthBar.SetHealth(point);

                    healthBar.setMyGamTransform(spawnedObject1.transform);
                    h.name = $"Health : {id}";
                    ni1.setHealthBar(healthBar);
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
                playerImpacted?.ForEach(playid =>
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

            if (id == ClientID)
            {
                OnPlayerRespawn.Invoke();
            }
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
            if (ni.GetComponent<TankGeneral>() != null)
            {
                float type = E.data["type"].f;
                float speed = E.data["tank"]["speed"].f;
                if (speed >= 30)
                {
                    speed = 30;
                }
                if (type == 1)
                {
                    var targetDistance = Vector3.Distance(new Vector3(x, y, 0), ni.transform.position);
                    var time = targetDistance / speed;
                    StartCoroutine(MoveSmoothing(ni.transform, new Vector3(x, y, 0), time));

                }
                else
                {
                    StartCoroutine(AIPositionSmoothing(ni.transform, new Vector3(x, y, 0)));
                }

            }
            else
            {
                StartCoroutine(AIPositionSmoothing(ni.transform, new Vector3(x, y, 0)));

            }

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

            if (id == ClientID)
            {
                float time = e.data["time"].f;
                Debug.Log(time);
                OnPlayerDied.Invoke(time);
            }
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
            Debug.Log(health);
            var healthBar = ni.getHealthBar();
            healthBar.SetHealth(health);

        });

        On("updateFlagPoint", (e) =>
        {
            string id = e.data["id"].str;
            float point = e.data["point"].f;
            float team = e.data["team"].f;
            Debug.Log(team);
            var ni = serverObjects[id];
            //   ni.gameObject.SetActive(false);
            var healthBar = ni.getHealthBar();
            healthBar.SetTeam(team);
            healthBar.SetHealth(point);
        });

        On("loadWaiting", (E) =>
        {
            Debug.Log("Switching to waiting choose hero");
            SceneManagement.Instance.LoadLevel(SceneList.WAITING, (levelName) =>
           {
               OnUpdatePlayer.Invoke(E);
               FindObjectOfType<WaitingSceneManagement>().time = E.data["time"].f;
               SceneManagement.Instance.UnLoadLevel(SceneList.LOBBY_SCREEN);
           });


        });

        On("reloadGame", (E) =>
        {
            Debug.Log("reload game");
            string map = E.data["map"].str;
            string gameMode = E.data["gameMode"].str;

            float maxTime = E.data["time"].f;

            OnLoadGameMode.Invoke(gameMode, map, maxTime);

            myMap = map;
            OnStartChat.Invoke(E);

            SceneManagement.Instance.LoadLevel(map, (levelName) =>
            {
                SceneManagement.Instance.UnLoadLevel(SceneList.LOBBY_SCREEN);
            });
        });
        On("loadGame", (E) =>
        {
            Debug.Log("Join game");
            string map = E.data["map"].str;
            string gameMode = E.data["gameMode"].str;
            float maxTime = E.data["time"].f;

            OnLoadGameMode.Invoke(gameMode, map, maxTime);
            myMap = map;
            OnStartChat.Invoke(E);
            SceneManagement.Instance.LoadLevel(map, (levelName) =>
            {
                SceneManagement.Instance.UnLoadLevel(SceneList.WAITING);
            });

        });

        On("startAutoMove", (E) =>
        {
            string id = E.data["id"].str;
            float autoSpeed = E.data["speed"].f;
            float x = E.data["direction"]["x"].f;
            float y = E.data["direction"]["y"].f;
            float startx = E.data["startPos"]["x"].f;
            float starty = E.data["startPos"]["y"].f;
            float range = E.data["range"].f;
            bool rotate = E.data["rotate"].b;
            NetworkIdentity ni = serverObjects[id];

            var tankgen = ni.GetComponent<TankGeneral>();
            Debug.Log(autoSpeed + " xx");
            //toc bien
            if (autoSpeed >= 30)
            {
                autoSpeed = 30;
                var flashEf = ni.GetFlash();
                if (flashEf != null)
                {
                    flashEf.transform.position = ni.transform.position - range * new Vector3(x, y, 0);

                    var fl = Instantiate(flashEf, networkContainer);
                    Destroy(fl, 0.3f);
                }
                if (!ni.IsControlling())
                {
                    return;
                }
                RaycastHit2D hit = Physics2D.BoxCast(ni.transform.position - range * new Vector3(x, y, 0), new Vector2(tankgen.boxCollider.size.x, tankgen.boxCollider.size.y), 0, -new Vector2(x, y), 0, LayerMask.GetMask("Wall"));
                if (hit.collider == null)
                {
                    StartCoroutine(MoveSmoothing(ni.transform, ni.transform.position - range * new Vector3(x, y, 0), range / 30));
                    Invoke("StopFocus", 0.2f);
                    return;
                }
            }

            tankgen.IsAutoMove = true;
            tankgen.AutoSpeed = autoSpeed;
            tankgen.AutoDirection = new Vector2(x, y);
            tankgen.StartPos = new Vector2(startx, starty);
            tankgen.Range = range;
            // quay huong

        });

        On("resetPlayer", (E) =>
        {
            string id = E.data["id"].str;
            float speed = E.data["tank"]["speed"].f;
            NetworkIdentity ni = serverObjects[id];


        });

        On("startFocusOn", (E) =>
        {
            string id = E.data["id"].str;
            NetworkIdentity ni = serverObjects[id];
            ni.GetComponent<NetworkTransform>().IsFocusOn = true;
        });

        On("endFocusOn", (E) =>
        {
            Debug.Log("haha");
            string id = E.data["id"].str;
            Debug.Log("haha");
            NetworkIdentity ni = serverObjects[id];
            ni.GetComponent<NetworkTransform>().IsFocusOn = false;

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
            OnTimeSkillUpdate2.Invoke(E);
        });


        On("updateHero", (e) =>
        {
            OnChangeHero.Invoke(e);
        });

        On("lobbyUpdate", (e) =>
        {
            Debug.Log("Lobby update " + e.data["state"].str);
            curState = e.data["state"].str;
            OnGameStateChange.Invoke(e);
            if (e.data["state"].str == "EndGame")
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
            }


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

        On("someoneLoginYourAccount", (E) =>
        {
            List<string> sceneout = new List<string>();
            foreach (var i in SceneManagement.Instance.CurrentlyLoadedScenes)
            {
                if (i != "Intro" || i != SceneList.ONLINE)
                {
                    sceneout.Add(i);
                }
            }
            foreach (var s in sceneout)
            {
                SceneManagement.Instance.UnLoadLevel(s);

            }

            SceneManagement.Instance.LoadLevel(SceneList.MAIN_MENU, (levelName) =>
            {
                //FindObjectOfType<MenuManager>().message.text = "Your account is logged in somewhere else";
                NotificationManager.Instance.DisplayNotification("Your account is logged in somewhere else", SceneList.MAIN_MENU);

            });
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

    private IEnumerator MoveSmoothing(Transform aiTransform, Vector3 goalPosition, float count)
    {
        float currentTime = 0.0f;
        Vector3 startPosition = aiTransform.position;

        while (currentTime < count)
        {
            currentTime += Time.deltaTime;

            if (currentTime <= count)
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

    public void StopFocus()
    {
        Emit("stopAutoMoving");
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
        SceneManagement.Instance.LoadLevel(SceneList.LOBBY_SCREEN, (levelName) =>
        {
            SceneManagement.Instance.UnLoadLevel(myMap);
        });
    }

    private void ReturnToMainMenuLogin(string error)
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
            //FindObjectOfType<MenuManager>().message.text = error;
            NotificationManager.Instance.DisplayNotification(error, SceneList.MAIN_MENU);
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
        SceneManagement.Instance.LoadLevel(SceneList.LOBBY_SCREEN, (levelName) =>
        {
            SceneManagement.Instance.UnLoadLevel(myMap);
            //  FindObjectOfType<MenuManager>().message.text = error;
        });
    }

    private IEnumerator RemoveEfAftertime(EffectAnimation efAni, string id, float t)
    {
        yield return new WaitForSeconds(t);
        efAni.RemoveEffect(id);
    }
}
