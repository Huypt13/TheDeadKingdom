using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ListRankManager : MonoBehaviour
{
    [SerializeField]
    private GameObject prefabRankPoint;

    [SerializeField]
    private GameObject rankPointContainer;




    // Start is called before the first frame update
    void Start()
    {
        foreach (Transform child in rankPointContainer.transform)
        {
            GameObject.Destroy(child.gameObject);
        }

        for (int star = 1; star < 102; star += 5)
        {
            GameObject tankInventory = Instantiate(prefabRankPoint);
            tankInventory.transform.parent = rankPointContainer.transform;
            tankInventory.transform.localScale = new Vector3(1f, 1f, 1f);

            GameObject imgTankIcon = tankInventory.transform.GetChild(0).GetChild(2).gameObject;
            imgTankIcon.GetComponent<Image>().sprite = ImageManager.Instance.GetRankImage(star);
            if (ImageManager.Instance.GetRankName(star) == ImageManager.Instance.GetRankName(LobbyScreenManager.playerStar))
            {
                imgTankIcon.transform.localScale = new Vector3(45f, 45f, 45f);
            }

            GameObject txtTankLevel = tankInventory.transform.GetChild(0).GetChild(1).gameObject;
            txtTankLevel.GetComponent<Text>().text = ImageManager.Instance.GetRankName(star);

            //GameObject txtTankRemaining = tankInventory.transform.GetChild(2).GetChild(1).gameObject;
            //txtTankRemaining.GetComponent<Text>().text = e.remaining + "";
            //GameObject txtTankName = tankInventory.transform.GetChild(3).gameObject;
            //txtTankName.GetComponent<Text>().text = e.tank.name + "";

            //tankInventory.GetComponent<Button>().onClick.AddListener(() =>
            //{
            //    tankDetail = e;
            //    SceneManagement.Instance.LoadLevel(SceneList.TANK_DETAIL, (levelName) =>
            //    {
            //        //SceneManagement.Instance.UnLoadLevel(SceneList.LOBBY_SCREEN);
            //    });
            //});


        }

    }

    // Update is called once per frame
    void Update()
    {

    }

    public void BackToMainLobby()
    {
        SceneManagement.Instance.UnLoadLevel(SceneList.LIST_RANK);
    }
}
