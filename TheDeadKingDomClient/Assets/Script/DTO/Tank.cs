using System;
[Serializable]
public class Tank
{
    public string _id;
    public string name;
    public float classType;
    public string typeId;
    public float armor;
    public float speed;
    public float rotationSpeed;
    public float damage;
    public float health;
    public float attackSpeed;
    public float bulletSpeed;
    public float shootingRange;
    public float level;
    public Skill skill1;
    public Skill skill2;
    public Skill skill3;
}

[Serializable]
public class Skill
{
    public string name;
    public string description;
}