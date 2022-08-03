using System;
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
    private Image imageTankDetail;
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
    enum TankClasses
    {
        Tanker = 1,
        Support = 2,
        Assasin = 3,
    };

    // Start is called before the first frame update
    void Start()
    {
        TankRemain tankDetail = InventoryManager.tankDetail;

        imageTankDetail.sprite = ImageManager.Instance.GetImage(tankDetail.tank.typeId, tankDetail.tank.level, ImageManager.ImageType.TankDetail);

        level.text = tankDetail.tank.level + "";
        remaining.text = tankDetail.remaining + "";
        tankName.text = tankDetail.tank.name;
        tankRole.text = Enum.GetName(typeof(TankClasses), (int)tankDetail.tank.classType);
        armor.text = tankDetail.tank.armor + "";
        speed.text = tankDetail.tank.speed + "";
        rotateSpeed.text = tankDetail.tank.rotationSpeed + "";
        damage.text = tankDetail.tank.damage + "";
        health.text = tankDetail.tank.health + "";
        attackSpeed.text = tankDetail.tank.attackSpeed + "";
        bulletSpeed.text = tankDetail.tank.bulletSpeed + "";
        shootingRange.text = tankDetail.tank.shootingRange + "";

        skill1.transform.GetChild(0).gameObject.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(tankDetail.tank.typeId, tankDetail.tank.level, ImageManager.ImageType.Skill1);
        skill1.transform.GetChild(1).gameObject.GetComponent<Text>().text = tankDetail.tank.skill1.name;
        skill1.transform.GetChild(2).gameObject.GetComponent<Text>().text = tankDetail.tank.skill1.description;

        skill2.transform.GetChild(0).gameObject.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(tankDetail.tank.typeId, tankDetail.tank.level, ImageManager.ImageType.Skill2);
        skill2.transform.GetChild(1).gameObject.GetComponent<Text>().text = tankDetail.tank.skill2.name;
        skill2.transform.GetChild(2).gameObject.GetComponent<Text>().text = tankDetail.tank.skill2.description;

        skill3.transform.GetChild(0).gameObject.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(tankDetail.tank.typeId, tankDetail.tank.level, ImageManager.ImageType.Skill3);
        skill3.transform.GetChild(1).gameObject.GetComponent<Text>().text = tankDetail.tank.skill3.name;
        skill3.transform.GetChild(2).gameObject.GetComponent<Text>().text = tankDetail.tank.skill3.description;

    }

    // Update is called once per frame
    void Update()
    {

    }
}
