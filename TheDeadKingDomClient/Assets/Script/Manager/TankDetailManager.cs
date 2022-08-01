using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class TankDetailManager : MonoBehaviour
{
    [SerializeField]
    private Text level;
    [SerializeField]
    private Text remaining;
    [SerializeField]
    private Text tankName;
    [SerializeField]
    private Text tankRole;
    [SerializeField]
    private Text armor;
    [SerializeField]
    private Text speed;
    [SerializeField]
    private Text rotateSpeed;
    [SerializeField]
    private Text damage;
    [SerializeField]
    private Text health;
    [SerializeField]
    private Text attackSpeed;
    [SerializeField]
    private Text bulletSpeed;
    [SerializeField]
    private Text shootingRange;
    [SerializeField]
    private GameObject skill1;
    [SerializeField]
    private GameObject skill2;
    [SerializeField]
    private GameObject skill3;

    // Start is called before the first frame update
    void Start()
    {
        TankRemain tankDetail = InventoryManager.tankDetail;

        level.text = tankDetail.tank.level + "";
        remaining.text = tankDetail.remaining + "";
        tankName.text = tankDetail.tank.level + "Quang Trung";
        tankRole.text = tankDetail.tank.health + "Sat thu";
        armor.text = tankDetail.tank.armor + "";
        speed.text = tankDetail.tank.speed + "";
        rotateSpeed.text = tankDetail.tank.rotationSpeed + "";
        damage.text = tankDetail.tank.damage + "";
        health.text = tankDetail.tank.health + "";
        attackSpeed.text = tankDetail.tank.attackSpeed + "";
        bulletSpeed.text = tankDetail.tank.bulletSpeed + "";
        shootingRange.text = tankDetail.tank.shootingRange + "";


    }

    // Update is called once per frame
    void Update()
    {

    }
}
