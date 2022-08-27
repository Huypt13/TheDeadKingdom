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
        GetComponentInParent<Canvas>().renderMode = RenderMode.ScreenSpaceCamera;
        GetComponentInParent<Canvas>().worldCamera = Camera.main;
        GetComponentInParent<Canvas>().sortingLayerName = "GamePlay";
        GetComponentInParent<Canvas>().sortingOrder = 1;

        gameObject.SetActive(true);
        tooltipText.text = content;
        float textPaddingSize = 4f;
        Vector2 backgroundSize = new Vector2(Mathf.Min(280, tooltipText.preferredWidth + textPaddingSize * 4f), tooltipText.preferredHeight + textPaddingSize * 2f);
        backgroundTransform.sizeDelta = backgroundSize;
    }

    public void HideTooltip()
    {
        GetComponentInParent<Canvas>().renderMode = RenderMode.ScreenSpaceOverlay;
        gameObject.SetActive(false);
    }
}
