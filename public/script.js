// Check user's preference on page load
if (
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Toggle Dark Mode
  const toggleButton = document.getElementById('dark-mode-toggle');
  toggleButton.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
  
    // Save user's preference
    if (document.documentElement.classList.contains('dark')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
  

const voiceSelect = document.querySelector('#voiceSelect');
const playButton = document.querySelector('#playButton');
const textInput = document.querySelector('textarea');
const languageSelect = document.querySelector('#languageSelect');


const languages =[
    {code:'en',name:'English'},
    {code:'es',name:'Spanish'},
    {code:'fr',name:'French'},
    {code:'de',name:'German'},
    {code:'it',name:'Italian'},
    {code:'ja',name:'Japanese'},
    {code:'zh-CN',name:'Chinese (Simplified)'}
]



languages.forEach(({code,name})=>{
    const option = document.createElement('option');
    option.value=code;
    option.textContent=name;
    languageSelect.appendChild(option);
});

let voices =[];
function loadVoices(){
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML=voices.map((voice,index)=>`<option value="${index}">${voice.name} (${voice.lang})</option>`).join('');
}

//Trigger loading voice when they are available
speechSynthesis.onvoiceschanged=loadVoices;
loadVoices();


//translate text with serverless function

// Translate text with serverless function
async function translateText(text, targetLang) {
    try {
        const response = await fetch('api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                target: targetLang
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        // Access the translated text from the new structure
        return data.translatedText;
    } catch (error) {
        console.error('Error in translation', error);
    }
}


//Tts

function playText(text,voiceIndex){
    const utterance = new SpeechSynthesisUtterance(text);
    if(voices[voiceIndex])utterance.voice=voices[voiceIndex];
    speechSynthesis.speak(utterance);
}



//play TTS

playButton.addEventListener('click',async () => {
    const text = textInput.value.trim();
    const targetLang = languageSelect.value;
    const selectedVoiceIndex = voiceSelect.value;

    if(!text){
        alert('Please enter some text to play');
        return;
    }
    try{
        const translatedText = await translateText(text,targetLang);
        playText(translatedText,selectedVoiceIndex);
    }
    catch(error){
        console.error('Error playing text',error);
        alert('Something went wrong with TTS');
    }
})