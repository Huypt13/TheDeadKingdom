using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
public class LoadingIcon : MonoBehaviour
{
    private RectTransform rectComponent;
    private float rotateSpeed = 200f;

    private void Start()
    {
        rectComponent = GetComponent<RectTransform>();
    }

    private void Update()
    {
       transform.Rotate(0f, 0f, rotateSpeed * Time.deltaTime);
    }
}