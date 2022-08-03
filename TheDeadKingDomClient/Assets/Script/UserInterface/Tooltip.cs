using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Tooltip : MonoBehaviour
{
    private Text tooltipText;
    private RectTransform backgroundTransform;

    // Start is called before the first frame update
    void Awake()
    {
        backgroundTransform = GetComponent<RectTransform>();
        tooltipText = transform.Find("Text").GetComponent<Text>();
        //ShowTooltip("This is content of tooltip");
        HideTooltip();

        GetComponentInParent<Canvas>().worldCamera = Camera.main;
    }

    // Update is called once per frame
    void Update()
    {
        Vector2 localPoint;
        RectTransformUtility.ScreenPointToLocalPointInRectangle(transform.parent.GetComponent<RectTransform>(), Input.mousePosition, Camera.main, out localPoint);
        //RectTransformUtility.ScreenPointToWorldPointInRectangle(transform.parent.GetComponent<RectTransform>(), Input.mousePosition, Camera.main, out localPoint);
        //localPoint = RectTransformUtility.WorldToScreenPoint(Camera.main, Input.mousePosition);

        transform.localPosition = (localPoint + new Vector2(0f, 20f));

    }

    public void ShowTooltip(string content)
    {
        gameObject.SetActive(true);
        tooltipText.text = content;
        float textPaddingSize = 4f;
        Vector2 backgroundSize = new Vector2(tooltipText.preferredWidth + textPaddingSize * 4f, tooltipText.preferredHeight + textPaddingSize * 2f);
        backgroundTransform.sizeDelta = backgroundSize;
    }

    public void HideTooltip()
    {
        gameObject.SetActive(false);
    }
}
