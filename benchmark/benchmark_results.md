# Sauti ASR Benchmark Report
*Sahara CodeSwitch Africa Challenge — Legal & Public Services Track*

## 1. Methodology & Test Set Composition
- Total test clips: 11
- Dialects & Code-Switching: grouped from Swahili-English, Hausa-English, Yoruba-English, Pidgin-English
- Evaluation metrics: Word Error Rate (WER), Character Error Rate (CER), Named Entity Accuracy, and inference latency.
- Validation run: false.

## 2. Model Performance Summary
| Model | Overall WER | CER | Code-Switched WER | Code-Switched CER | Entity Accuracy | Avg Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sahara (Intron)** | 43.7% | 28.8% | 43.7% | 28.8% | **19.1%** | 9749ms |
| **Whisper (HF openai/whisper-large-v3)** | 67% | 47.7% | 67% | 47.7% | **21.7%** | 24082ms |
| **Vosk (offline)** | 89.5% | 61.2% | 89.5% | 61.2% | **0%** | 32426ms |

## 3. Detailed Results Table
| Filename | Language Group | Model | WER | CER | Entity Accuracy | Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `swahili-3.wav` | Swahili-English | Sahara (Intron) | 25.1% | 15.7% | 20.0% | 6543ms |
| `swahili-3.wav` | Swahili-English | Whisper (HF openai/whisper-large-v3) | 83.0% | 60.0% | 60.0% | 33863ms |
| `swahili-3.wav` | Swahili-English | Vosk (offline) | 98.0% | 56.7% | 0.0% | 21318ms |
| `swahili-2.wav` | Swahili-English | Sahara (Intron) | 23.3% | 13.1% | 40.0% | 7550ms |
| `swahili-2.wav` | Swahili-English | Whisper (HF openai/whisper-large-v3) | 50.5% | 40.0% | 20.0% | 21960ms |
| `swahili-2.wav` | Swahili-English | Vosk (offline) | 81.9% | 49.3% | 0.0% | 38424ms |
| `swahili-1.wav` | Swahili-English | Sahara (Intron) | 16.8% | 8.0% | 0.0% | 5847ms |
| `swahili-1.wav` | Swahili-English | Whisper (HF openai/whisper-large-v3) | 56.8% | 32.5% | 0.0% | 36260ms |
| `swahili-1.wav` | Swahili-English | Vosk (offline) | 92.4% | 54.3% | 0.0% | 35348ms |
| `hausa-3.wav` | Hausa-English | Sahara (Intron) | 55.0% | 32.0% | 50.0% | 14985ms |
| `hausa-3.wav` | Hausa-English | Whisper (HF openai/whisper-large-v3) | 82.9% | 51.3% | 50.0% | 14498ms |
| `hausa-3.wav` | Hausa-English | Vosk (offline) | 99.5% | 65.7% | 0.0% | 26796ms |
| `hausa-2.wav` | Hausa-English | Sahara (Intron) | 43.1% | 20.3% | 50.0% | 8233ms |
| `hausa-2.wav` | Hausa-English | Whisper (HF openai/whisper-large-v3) | 98.2% | 70.5% | 0.0% | 28358ms |
| `hausa-2.wav` | Hausa-English | Vosk (offline) | 100.0% | 65.7% | 0.0% | 36507ms |
| `hausa-1.wav` | Hausa-English | Sahara (Intron) | 62.5% | 42.4% | 0.0% | 5660ms |
| `hausa-1.wav` | Hausa-English | Whisper (HF openai/whisper-large-v3) | 80.1% | 49.5% | 0.0% | 18133ms |
| `hausa-1.wav` | Hausa-English | Vosk (offline) | 98.6% | 70.0% | 0.0% | 24848ms |
| `yoruba-3.wav` | Yoruba-English | Sahara (Intron) | 64.5% | 44.9% | 0.0% | 16466ms |
| `yoruba-3.wav` | Yoruba-English | Whisper (HF openai/whisper-large-v3) | 51.0% | 38.6% | 25.0% | 21500ms |
| `yoruba-3.wav` | Yoruba-English | Vosk (offline) | 93.3% | 69.4% | 0.0% | 54026ms |
| `yoruba-2.wav` | Yoruba-English | Sahara (Intron) | 71.7% | 53.1% | 0.0% | 10982ms |
| `yoruba-2.wav` | Yoruba-English | Whisper (HF openai/whisper-large-v3) | 68.7% | 49.2% | 25.0% | 26600ms |
| `yoruba-2.wav` | Yoruba-English | Vosk (offline) | 91.1% | 71.9% | 0.0% | 48743ms |
| `yoruba-1.wav` | Yoruba-English | Sahara (Intron) | 64.1% | 47.7% | 0.0% | 6638ms |
| `yoruba-1.wav` | Yoruba-English | Whisper (HF openai/whisper-large-v3) | 72.0% | 58.3% | 33.3% | 18968ms |
| `yoruba-1.wav` | Yoruba-English | Vosk (offline) | 87.6% | 68.8% | 0.0% | 26969ms |
| `pidgin-3.wav` | Pidgin-English | Sahara (Intron) | 27.8% | 20.0% | 50.0% | 16983ms |
| `pidgin-3.wav` | Pidgin-English | Whisper (HF openai/whisper-large-v3) | 38.4% | 31.9% | 25.0% | 19415ms |
| `pidgin-3.wav` | Pidgin-English | Vosk (offline) | 62.2% | 40.2% | 0.0% | 19629ms |
| `pidgin-1.wav` | Pidgin-English | Sahara (Intron) | 27.1% | 19.3% | 0.0% | 7357ms |
| `pidgin-1.wav` | Pidgin-English | Whisper (HF openai/whisper-large-v3) | 55.9% | 42.6% | 0.0% | 25344ms |
| `pidgin-1.wav` | Pidgin-English | Vosk (offline) | 80.3% | 60.9% | 0.0% | 24081ms |

## 4. Key Findings
- Live Sahara is called via the Intron file-upload sync endpoint and is expected to return transcript data; no hardcoded baseline is used.
- Whisper is routed through Hugging Face Inference using the `openai/whisper-large-v3` model and `HF_API_TOKEN`.
- Vosk is run locally from a downloaded model directory.
- CER is calculated beside WER and the text is normalized before scoring.
