#!/bin/bash

# Funzione per stampare messaggi informativi
echo_info() {
  echo -e "\e[32m$1\e[0m"
}

# Funzione per stampare messaggi di avviso in rosso
echo_warning() {
  echo -e "\e[31m$1\e[0m"
}

# Funzione per controllare se i file essenziali sono presenti nella directory corrente
check_essential_files() {
  if [[ ! -f "./.env" || ! -f "./docker-compose.yml" ]]; then
    echo_warning "I file .env e docker-compose.yml sono necessari per proseguire."
    if [[ ! -f "./.env" ]]; then
      echo_warning "File .env mancante."
    fi
    if [[ ! -f "./docker-compose.yml" ]]; then
      echo_warning "File docker-compose.yml mancante."
    fi
    echo_warning "Si prega di creare i file mancanti e riprovare."
    exit 1
  else
    echo_info "Tutti i file essenziali sono presenti."
  fi
}

# Controlla se i file essenziali sono presenti
check_essential_files

# Funzione per chiedere conferma all'utente con una risposta predefinita
ask_option() {
  echo -e "\e[34mVuoi effettuare il setup iniziale di progetto oppure effettuare il deploy dell'applicativo?\e[0m"
  echo -e "\e[34mPremere [1] per setup iniziale di progetto\e[0m"
  echo -e "\e[34mPremere [2] per effettuare deploy dell'applicativo (default)\e[0m"
  echo -e "\e[34mPremere Ctrl+C per annullare.\e[0m"
  
  read -p "Seleziona un'opzione [2]: " option
  option=${option:-2} # Imposta l'opzione predefinita su 2 se viene premuto solo Invio

  case $option in
    1) return 1;;  # setup iniziale di progetto
    2) return 2;;  # deploy dell'applicativo
    *) echo "Opzione non valida, procedo con il deploy di default."; return 2;;
  esac
}

# Funzione per chiedere la versione di release all'utente
ask_release_version() {
  read -p "Inserisci la versione di release (es. v0.0.27): " release_version
  echo $release_version
}

# Funzione per chiedere conferma all'utente
ask_confirmation() {
  while true; do
    read -p "$1 [s/n]: " response
    case $response in
      [Ss]* ) return 0;; # true
      [Nn]* ) return 1;; # false
      * ) echo "Per favore, rispondi con s per sì o n per no.";;
    esac
  done
}

# Chiede all'utente di scegliere un'opzione
ask_option
selected_option=$?

if [ $selected_option -eq 1 ]; then
  echo_info "Setup iniziale di progetto selezionato."

# Creazione della cartella backups-db nel percorso corrente
echo_info "Creazione della cartella backups-db nel percorso corrente..."
mkdir -p ./backups-db

# Impostazione del proprietario della cartella su lxd:root
echo_info "Impostazione del proprietario della cartella backups-db su lxd:root..."
# sudo chown lxd:root ./backups-db
sudo chown 999 ./backups-db

# Funzione per stampare messaggi informativi
echo_info() {
  echo -e "\e[32m$1\e[0m"
}

# Funzione per chiedere conferma all'utente
ask_confirmation() {
  while true; do
    read -p "$1 [s/n]: " response
    case $response in
      [Ss]* ) return 0;; # true
      [Nn]* ) return 1;; # false
      * ) echo "Per favore, rispondi con s per sì o n per no.";;
    esac
  done
}

echo_info "Verifica dei container attivi..."

# Spegni i container attivi se presenti
if [ "$(sudo docker ps -q)" ]; then
  echo_info "Container attivi trovati:"
  sudo docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

# Inserisci il messaggio di attenzione con evidenziazione e nuova linea
if ask_confirmation $'\e[1;31mATTENZIONE TROVATI CONTAINER ESISTENTI ATTIVI!\e[0m\nVuoi procedere con lo spegnimento e la rimozione dei container?'; then  
  
    echo_info "Spegni i container attivi..."
    sudo docker stop $(sudo docker ps -q)

    echo_info "Rimozione dei container..."
    sudo docker rm $(sudo docker ps -a -q)
  else
    echo_info "Operazione annullata."
    exit 1
  fi
else
  echo_info "Nessun container attivo trovato."
fi

echo_info "Controllo delle versioni di Docker installate..."

# Controlla se ci sono pacchetti Docker installati
installed_packages=()
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  if dpkg -l | grep -q "^ii.*$pkg"; then
    installed_packages+=($pkg)
  fi
done

# Se sono presenti pacchetti Docker installati, chiedi conferma prima di rimuoverli
if [ ${#installed_packages[@]} -ne 0 ]; then
  echo_info $'\e[1;31mATTENZIONE!\e[0m\nSono stati trovati i seguenti pacchetti Docker installati:'
  echo "${installed_packages[*]}"
  
  # Chiedi conferma all'utente con scelta di default su NO
  if ask_confirmation "Vuoi procedere con la rimozione dei pacchetti Docker? [s/n] (default: n): "; then
    echo_info "Rimozione dei pacchetti Docker esistenti..."
    for pkg in "${installed_packages[@]}"; do
      sudo apt-get remove -y $pkg
    done
  else
    echo_info "Operazione annullata."
    exit 1
  fi
else
  echo_info "Nessuna versione di Docker trovata."
fi

echo_info "Aggiornamento della lista dei pacchetti..."
sudo apt-get update

echo_info "Installazione delle dipendenze necessarie (ca-certificates, curl)..."
sudo apt-get install -y ca-certificates curl

echo_info "Creazione della directory per le chiavi GPG di Docker..."
sudo install -m 0755 -d /etc/apt/keyrings

echo_info "Download della chiave GPG ufficiale di Docker..."
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

echo_info "Impostazione dei permessi della chiave GPG..."
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo_info "Aggiunta del repository Docker alle sorgenti APT..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo_info "Aggiornamento della lista dei pacchetti..."
sudo apt-get update

echo_info "Installazione di Docker (docker-ce, docker-ce-cli, containerd.io, docker-buildx-plugin, docker-compose-plugin)..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo_info "Installazione completata! Ricordati di caricare il dockerfile ed il file di enviroment prima di effettuare il deploy applicativo"

  
else
  echo_info "Deploy dell'applicativo selezionato."

  while true; do
    # Chiede all'utente di specificare la versione di release
    release_version=$(ask_release_version)

    # Stampa la versione selezionata in rosso e chiede conferma all'utente
    echo_warning "Hai selezionato la versione: $release_version"
    if ask_confirmation "Sei sicuro che questa sia la versione corretta?"; then
      # Se confermato, esce dal ciclo e prosegue con il deploy
      break
    else
      echo_info "Reinserisci la versione desiderata."
    fi
  done

  # Esegue il comando di deploy con la versione specificata
  echo_info "Esecuzione del deploy con la versione $release_version..."
  docker login ghcr.io
  release_version=$release_version docker compose up -d
fi