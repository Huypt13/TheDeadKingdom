using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AudioManager : Singleton<AudioManager>
{
    [SerializeField]
    private AudioClip pickTank, countDownFight, gameBackground;

    [SerializeField]
    private AudioClip shootingSound;

    private AudioSource backgroundAudioSource;
    private AudioSource effectAudioSource;

    // Start is called before the first frame update
    void Start()
    {
        effectAudioSource = gameObject.AddComponent<AudioSource>();
        effectAudioSource.loop = false;
        backgroundAudioSource = gameObject.AddComponent<AudioSource>();
        backgroundAudioSource.loop = true;
    }

    public void SetVolume(float volume)
    {
        effectAudioSource.volume = volume;
        backgroundAudioSource.volume = volume;
        Debug.Log("Volume: " + effectAudioSource.volume);
    }

    public void PlayEffectSoundOneShot(string soundType)
    {
        switch (soundType)
        {
            case "pickTank":
                effectAudioSource.PlayOneShot(pickTank);
                break;
            case "countDownFight":
                effectAudioSource.PlayOneShot(countDownFight);
                break;
            case "shootingSound":
                effectAudioSource.PlayOneShot(shootingSound);
                break;
        }
    }

    public void PlayBackgroundSound(string soundType)
    {
        switch (soundType)
        {
            case "gameBackground":
                backgroundAudioSource.clip = gameBackground;
                backgroundAudioSource.Play();
                break;
        }
    }

    public void StopBackgroundSound()
    {
        backgroundAudioSource.Stop();
    }

    // Update is called once per frame
    void Update()
    {

    }
}
