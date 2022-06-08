using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TankGeneral : MonoBehaviour
{
    const float BARREL_PIVOT_OFFSET = 90.0f;
    [Header("Data")]
    [SerializeField]
    private float speed;
    [SerializeField]
    private float rotation;

    [Header("Object References")]
    [SerializeField]
    private Transform barrelPivot;
    [SerializeField]
    private Transform bulletSpawnPoint;
    private float lastRotation;

    private BulletData bulletData;
    private Cooldown shootingCooldown;
    void Start()
    {

        // thiet lap lay tu bach-end
        shootingCooldown = new Cooldown(1);
        speed = 2;
        rotation = 60;
    }


    void Update()
    {
        TankMovement();
        BarrelRotation();
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
            //     bulletData.activator = NetworkClient.ClientID;
            bulletData.position.x = bulletSpawnPoint.position.x.TwoDecimals();
            bulletData.position.y = bulletSpawnPoint.position.y.TwoDecimals();
            bulletData.direction.x = bulletSpawnPoint.up.x;
            bulletData.direction.y = bulletSpawnPoint.up.y;

            //Send Bullet
            // networkIdentity.GetSocket().Emit("fireBullet", new JSONObject(JsonUtility.ToJson(bulletData)));
        }
    }
}
