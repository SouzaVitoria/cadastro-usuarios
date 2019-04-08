class UserController {

    constructor(formIdCreate, formIdUpdate, tableId){
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
         this.onSubmit();  
         this.onEdit();
         this.selectAll(); //Como já esta salvo no localStorage, apenas exibir na tela
    }

    onSubmit(){
        //document.querySelectorAll("button").forEach(function(){ });
        //Inserir valores 
        this.formEl.addEventListener("submit", event => { //Na variavel event sabemos qual foi elemento que disparou o evento - INFORMAÇÕES
         event.preventDefault(); //para tudo que o evento disparou   
         
          let btn = this.formEl.querySelector("[type=submit]");//Pegar e retornar botão
            btn.disable = true; 
          let values = this.getValues(this.formEl);
         //Fim da inserção

          if(!values){ //Antes de ler a foto se der problema ele já para por aqui e nem le a foto mais. Quando validamos ele mudou para boolean sendo que aqui é um objeto. Se for um objeto coloca-se isso para tirar o erro
            return false;
          }

          this.getPhoto(this.formEl).then((content )=>{
              values.photo = content; //sobreescrever para que tenha outro conteudo 
              
              values.save();
              this.addLine(values); //Quando colocar a imagem ele adiciona a linha
              
               this.formEl.reset(); //Zerar formulário antes de habilitar botão
              btn.disable = false;
          },(e)=>{ // se der erro
             console.error(e);
          }); //then
        });
    }//onSubmit

    onEdit(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();
        });
        this.formUpdateEl.addEventListener("submit", event =>{
            //Inserir valores 
             event.preventDefault(); //para tudo que o evento disparou 
             let btn = this.formUpdateEl.querySelector("[type=submit]");//Pegar e retornar botão
             btn.disable = true; 
             let values = this.getValues(this.formUpdateEl);

             let index = this.formUpdateEl.dataset.trIndex;  //Guardar Index para usar na edição
             let tr = this.tableEl.rows[index];

             let userOld = JSON.parse(tr.dataset.user); //Virando objeto
             //Substituição de 2 objetos - Direita sobreescreve o que estão a esquerda
             let result = Object.assign({}, userOld, values);//Juntar dois objetos para pode editar foto depois- values com userOld

                 //Substituir fotos
                 this.getPhoto(this.formUpdateEl).then((content)=>{

                        if(!values.photo) //Mantém a foto do próprio formulário
                        {
                          result._photo = userOld._photo; 
                        } else{
                            result._photo = content;
                        }
                     
                     let user = new User();
                     user.loadFromJSON(result);

                     user.save();

                     this.getTr(user, tr);

                     this.updateCount();
                     this.formUpdateEl.reset(); //Zerar formulário antes de habilitar botão
                     btn.disable = false;

                     this.showPanelCreate();

                },(e)=>{ // se der erro
                   console.error(e);
                }); //then
        });

    }
    getPhoto(formEl){ //callback função de retorno

        return new Promise((resolve, reject)=>{ //quando der certo e quando der errado
            let fileReader = new FileReader();

            let elements  = [...formEl.elements].filter(item =>{ //Array filtrado
                if(item.name === 'photo'){
                  return item;
                }
            });
  
            let file = elements[0].files[0]; // Da coleção de fotos quer pegar apenas um arquivo
  
            fileReader.onload = ()=>{ //quando a foto terminar -- A imagem pode ser pesada ou computador demorando para ler 
               
              resolve(fileReader.result);//Ter conteudo do arquivo
            };  
            fileReader.onerror = (e)=>{
                reject(e);
            }; //onerror

            if(file){
              fileReader.readAsDataURL(file); //Quando terminar de carregar a imagem executa essa função
            }else{
                resolve('dist/img/sem-foto.jpg'); //Para não ser obrigatório colocar uma imagem
            }
            
        });// return Promise

    }//getPhoto

    getValues(formEl){

        let user = {};
        let isValid = true;//Para verificar se o formulario esta valido

        [...formEl.elements].forEach(function(field, index){ //Para cada campo executa esse codigo -- ... SPREAD é um operador que facilita e não precisamos escrever quantos indices temos

            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){//Validar os dados do formulário
                field.parentElement.classList.add('has-error'); // Acessando o pai e add um novo metodo
                isValid = false;
            }

            if(field.name == "gender"){
                if(field.checked){
                    user [field.name] = field.value;
                }
                
            }else if(field.name == "admin"){
                user[field.name] = field.checked; //Verificar se a caixa esta selecionada
            }else{
                user [field.name] = field.value;
            }
            //console.log(index, field.name); //Ver as informações
            
        });//forEach

        if(! isValid){
            return false; // Se causar erro, Executa isso ai ele para. Como se fosse um break
        }

        return new User(user.name, user.gender, user.birth, user.country, user.email, user.password, user.photo, user.admin);
    }//getValues

    selectAll(){
        let users = User.getUsersStorage();
        users.forEach(dataUser=>{
            let user = new User();
            user.loadFromJSON(dataUser); //chamando nos getters e setters 
            this.addLine(user);
        });
    }

    addLine(dataUser){ 
        let tr = this.getTr(dataUser);
        
        this.tableEl.appendChild(tr); //AppendChild para adicionar o final - para de substituir

        this.updateCount(); 
    } 

    getTr(dataUser, tr = null){ //Seleciona qual tr que irá utilizar
        if(tr === null) tr = document.createElement('tr');
        tr.dataset.user = JSON.stringify(dataUser); //JSON... converte String que não da para ler para leitura...retornar qual tr que esta o valor que será editado - Sobreescrever a String

        tr.innerHTML = `
        <td> <img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"> </td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin)? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)} </td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);
        return tr;
    }

    addEventsTr(tr){
        tr.querySelector(".btn-delete").addEventListener("click", e=>{
            if(confirm("Deseja realmente Excluir?")){

                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove(); //metodo para remover do localStorage também
                tr.remove(); //Remover a linha do formulário
                this.updateCount();
            }
        });


        tr.querySelector(".btn-edit").addEventListener("click", e=>{ //Botão editar 
            let json = JSON.parse(tr.dataset.user);
            //Quando clicar no botão Editar coloca todos os dados digitados nos campos para edição
            
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for(let name in json){
               let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");
                if(field){ //Se o campo for encontrado/existir
                    switch(field.type){
                        case 'file':
                          continue;  // continue ignora tudo embaixo e vai para o próximo - COMO O REGISTER(DATA) FOI COLOCADO ELE NÃO É UM CAMPO E RETORNA NULO
                         break;
                        case 'radio':
                          field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                          field.checked = true; 
                         break;
                        case 'checkbox':
                          field.checked = json[name]; 
                         break;
                        default:
                         field.value = json[name];
                    }
                  //field.value = json[name]; //objeto JSON na propriedade nome
                }
            }
            this.formUpdateEl.querySelector(".photo").src = json._photo; //Dentro do formulario encontrar a tag class - precisnado trocar o atributo src
            this.showPanelUpdate();
        });
    }

    showPanelCreate(){
        document.querySelector("#box-user-create").style.display="block";
        document.querySelector("#box-user-update").style.display="none";
    }

    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display="none";
        document.querySelector("#box-user-update").style.display="block";
    }

    updateCount(){ //Calcula o total de usuários e de administradores 
        let numberUsers = 0;
        let numberAdmin = 0;
        [...this.tableEl.children].forEach(tr=>{ //children é a propriedade vista no dir -- Não é um array, é uma coleção, por isso foi convertido [] e o SPREAD
            numberUsers++;
            let user = JSON.parse(tr.dataset.user); //Mas para pegar cada um dos atributos precisa tornar String em um objeto
            if(user._admin){ //Pegando lá no GET por isso precisa de _
                numberAdmin++;
            }
        }); 

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
         
    }

} //class