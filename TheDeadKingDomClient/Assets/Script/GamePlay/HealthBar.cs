using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class HealthBar : MonoBehaviour
{

    public Slider slider;
    public bool isMyHealth;
    public float team;
    public Gradient myGradient1;
    public Gradient myGradient2;

    public Gradient gradient;
    public Gradient gradient2;
    public Gradient gradient0;
    public Image fill;
    private Transform myGameTransform;

    public void setMyGamTransform(Transform g)
    {
        myGameTransform = g;
    }
    public void setIsMyHealth(bool b)
    {
        isMyHealth = b;
    }
    public void SetTeam(float t)
    {
        team = t;
    }
    public void SetMaxHealth(float health)
    {
        slider.maxValue = health;
        slider.value = health;
        if (isMyHealth && team == 1)
            fill.color = myGradient1.Evaluate(1f);
        else if (isMyHealth && team == 2)
            fill.color = myGradient2.Evaluate(1f);
        else if (team == 1)
            fill.color = gradient.Evaluate(1f);
        else if (team == 2)
        {
            fill.color = gradient2.Evaluate(1f);

        }
        else
        {
            fill.color = gradient0.Evaluate(1f);

        }
    }

    public void SetHealth(float health)
    {
        slider.value = health;

        if (isMyHealth && team == 1)
            fill.color = myGradient1.Evaluate(slider.normalizedValue);
        else if (isMyHealth && team == 2)
            fill.color = myGradient2.Evaluate(slider.normalizedValue);
        else if (team == 1)
            fill.color = gradient.Evaluate(slider.normalizedValue);
        else if (team == 2)
        {
            fill.color = gradient2.Evaluate(slider.normalizedValue);

        }
        else
        {
            fill.color = gradient0.Evaluate(slider.normalizedValue);

        }
    }
    public void DestroyHealthBar()
    {
        DestroyImmediate(transform.parent.gameObject);
    }

    private void LateUpdate()
    {
        // transform.localPosition = new Vector3(-960, -540, 0);

        if (myGameTransform != null && !gameObject.CompareTag("Flag"))
        {
            Vector3 monsterPosition = new Vector3(myGameTransform.position.x, myGameTransform.position.y, myGameTransform.position.z); // we need to correct the position of the bar
            slider.transform.position = Camera.main.WorldToScreenPoint(monsterPosition + new Vector3(0, 0.9f, 0)); // we say that the position of the bar is a conversion of the position of the monster in my UI units.
        }


    }
}