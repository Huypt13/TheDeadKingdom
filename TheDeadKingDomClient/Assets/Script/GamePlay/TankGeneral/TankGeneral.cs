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
    [SerializeField]
    private Rigidbody2D rb;
    List<RaycastHit2D> castCollisions = new List<RaycastHit2D>();
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

    private void FixedUpdate()
    {
        if (networkIdentity.IsControlling())
        {
            TankMovement();
            BarrelRotation();
            Shooting();
        }
    }

    private void LateUpdate()
    {
        if (networkIdentity.IsControlling())
        {
            Camera.main.transform.position = new Vector3(transform.position.x, transform.position.y, -10);
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
        //    int count = rb.Cast(-transform.up * vertical, castCollisions, speed * Time.deltaTime);
        //int count = 0;
        //if (count == 0)
        //{
        //Debug.Log(LayerMask.GetMask("Tree"));
        //if (Physics2D.Raycast(transform.position, transform.TransformDirection(transform.up*vertical), speed * Time.fixedDeltaTime + 0.1f, LayerMask.GetMask("Tree")))
        //{
        //    // Debug.DrawRay(transform.position, -transform.up *vertical* hit.distance, Color.yellow);
        //    Debug.DrawRay(transform.position, transform.up * 10, Color.yellow);
        //    Debug.Log("Hit");
        //}
        //else
        //{
        //    Debug.DrawRay(transform.position, transform.up * 10, Color.white);
        transform.position += transform.up * vertical * speed * Time.deltaTime;
        //    Debug.Log("Did not Hit");
        //}
        //}
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
