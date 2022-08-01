using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class InventoryManager : MonoBehaviour
{
    [SerializeField]
    private GameObject prefabTankInventory;

    [SerializeField]
    private GameObject tankInventoryContainer;

    public static TankRemain tankDetail;

    // Start is called before the first frame update
    void Start()
    {
        foreach (Transform child in tankInventoryContainer.transform)
        {
            GameObject.Destroy(child.gameObject);
        }

        LobbyScreenManager.myTankList.ForEach(e =>
        {
            if (e.remaining > 0)
            {
                GameObject tankInventory = Instantiate(prefabTankInventory);
                tankInventory.transform.parent = tankInventoryContainer.transform;
                tankInventory.transform.localScale = new Vector3(1f, 1f, 1f);
                GameObject imgTankIcon = tankInventory.transform.GetChild(0).gameObject;
                imgTankIcon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(e.tank.typeId, e.tank.level, ImageManager.ImageType.TankEndMatch);
                GameObject txtTankLevel = tankInventory.transform.GetChild(1).GetChild(1).gameObject;
                txtTankLevel.GetComponent<Text>().text = e.tank.level + "";
                GameObject txtTankRemaining = tankInventory.transform.GetChild(2).GetChild(1).gameObject;
                txtTankRemaining.GetComponent<Text>().text = e.remaining + "";
                GameObject txtTankName = tankInventory.transform.GetChild(3).gameObject;
                txtTankName.GetComponent<Text>().text = e.tank.typeId + "-" + e.tank.level + "";

                tankInventory.GetComponent<Button>().onClick.AddListener(() =>
                {
                    tankDetail = e;
                    SceneManagement.Instance.LoadLevel(SceneList.TANK_DETAIL, (levelName) =>
                    {
                        //SceneManagement.Instance.UnLoadLevel(SceneList.LOBBY_SCREEN);
                    });
                });
            }


        });
    }

    // Update is called once per frame
    void Update()
    {

    }

    public void BackToMainLobby()
    {
        SceneManagement.Instance.UnLoadLevel(SceneList.TANK_INVENTORY);
    }
}
