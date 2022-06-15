using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TankGeneral : MonoBehaviour
{
    const float BARREL_PIVOT_OFFSET = 90.0f;

    private float speed = 1;
    private float rotation = 60;
    private float attackSpeed = 1;
    private float health = 100;

    [Header("Object References")]
    [SerializeField]
    private Transform barrelPivot;
    [SerializeField]
    private Transform bulletSpawnPoint;
    private float lastRotation;

    private BulletData bulletData;
    private Cooldown shootingCooldown;

    [Header("Class References")]
    [SerializeField]
    private NetworkIdentity networkIdentity;

    void Start()
    {

        // thiet lap lay tu bach-end
        shootingCooldown = new Cooldown(attackSpeed);
        bulletData = new BulletData();
        bulletData.position = new Position();
        bulletData.direction = new Position();

    }

    public void SetInitValue(float speed1, float rotation1, float attackSpeed1, float health1)
    {
        speed = speed1;
        rotation = rotation1;
        attackSpeed = attackSpeed1;
        health = health1;
        shootingCooldown = new Cooldown(attackSpeed);

    }

    void Update()
    {
        if (networkIdentity.IsControlling())
        {
            TankMovement();
            BarrelRotation();
            Shooting();
        }
    }

    public float GetLastRotation()
    {
        return lastRotation;
    }

    public void SetRotation(float Value)
    {
        barrelPivot.rotation = Quaternion.Euler(0, 0, Value + BARREL_PIVOT_OFFSET);
    }

    private void TankMovement()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        transform.position += -transform.up * vertical * speed * Time.deltaTime;
        transform.Rotate(new Vector3(0, 0, -horizontal * rotation * Time.deltaTime));
    }
    private void BarrelRotation()
    {
        Vector3 mousePosition = Camera.main.ScreenToWorldPoint(Input.mousePosition);
        Vector3 dif = mousePosition - transform.position;
        dif.Normalize();
        float rot = Mathf.Atan2(dif.y, dif.x) * Mathf.Rad2Deg;

        lastRotation = rot;

        barrelPivot.rotation = Quaternion.Euler(0, 0, rot + BARREL_PIVOT_OFFSET);
    }
    private void Shooting()
    {
        shootingCooldown.CooldownUpdate();

        if (Input.GetMouseButton(0) && !shootingCooldown.IsOnCooldown())
        {
            shootingCooldown.StartCooldown();

            //Define Bullet
            bulletData.activator = NetworkClient.ClientID;
            bulletData.position.x = bulletSpawnPoint.position.x.TwoDecimals();
            bulletData.position.y = bulletSpawnPoint.position.y.TwoDecimals();
            bulletData.direction.x = bulletSpawnPoint.up.x;
            bulletData.direction.y = bulletSpawnPoint.up.y;

            //Send Bullet
            networkIdentity.GetSocket().Emit("fireBullet", new JSONObject(JsonUtility.ToJson(bulletData)));
        }
    }
}
