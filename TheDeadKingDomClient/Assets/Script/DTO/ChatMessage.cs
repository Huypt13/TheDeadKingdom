using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TMPro;

[Serializable]
public class ChatMessage
{
    public string text;
    public TMP_Text textObject;
    public enum messageType
    {
        playerMessage,
        info
    }
}
