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
    private bool stunned = false;// choang
    private bool tiedUp = false;  // troi
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

    private CapsuleCollider2D capsuleCollider;
    private RaycastHit2D hit;
    private RaycastHit2D hit1;
    private Vector3 moveDelta;

    public float Speed { get => speed; set => speed = value; }
    public bool Stunned { get => stunned; set => stunned = value; }
    public bool TiedUp { get => tiedUp; set => tiedUp = value; }
    public float AttackSpeed
    {
        get => attackSpeed;
        set
        {
            attackSpeed = value;
            shootingCooldown = new Cooldown(AttackSpeed);
        }
    }

    void Start()
    {

        // thiet lap lay tu bach-end
        shootingCooldown = new Cooldown(AttackSpeed);
        bulletData = new BulletData();
        bulletData.position = new Position();
        bulletData.direction = new Position();
        capsuleCollider = GetComponent<CapsuleCollider2D>();

    }

    public void SetInitValue(float speed1, float rotation1, float attackSpeed1, float health1)
    {
        Speed = speed1;
        rotation = rotation1;
        AttackSpeed = attackSpeed1;
        health = health1;
        shootingCooldown = new Cooldown(AttackSpeed);

    }

    private void FixedUpdate()
    {
        if (networkIdentity.IsControlling())
        {
            if (!Stunned && !TiedUp)
                TankMovement();

            if (!Stunned)
                Shooting();
            BarrelRotation();
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
        Vector3 direction = transform.up;
        if (vertical < 0) direction *= -1;
        //it = Physics2D.CapsuleCast(transform.position,capsuleCollider.size, capsuleCollider.direction,0 , direction, LayerMask.GetMask("Wall"), Mathf.Infinity);
        hit = Physics2D.BoxCast(transform.position, new Vector2(capsuleCollider.size.x - 0.5f, capsuleCollider.size.y - 0.5f), 0, direction, Mathf.Abs(vertical * Speed * Time.deltaTime), LayerMask.GetMask("Wall"));
        if (hit.collider == null)
        {
            transform.position += transform.up * vertical * Speed * Time.deltaTime;
        }

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



            bulletData.activator = NetworkClient.ClientID;
            bulletData.position.x = bulletSpawnPoint.position.x.TwoDecimals();
            bulletData.position.y = bulletSpawnPoint.position.y.TwoDecimals();
            bulletData.direction.x = bulletSpawnPoint.up.x;
            bulletData.direction.y = bulletSpawnPoint.up.y;

            Debug.Log("shooting 1");
            //Send Bullet
            networkIdentity.GetSocket().Emit("fireBullet", new JSONObject(JsonUtility.ToJson(bulletData)));

        }
    }
}
