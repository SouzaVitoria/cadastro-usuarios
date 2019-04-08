class User{
     constructor(name, gender, birth, country, email, password, photo, admin ){
        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date(); //Data da criação - atual
     }

   get id(){
      return this._id;
   }

   get register(){
      return this._register;
   }
   get name(){
      return this._name;
   }
   get gender(){
      return this._gender;
   }
   get birth(){
      return this._birth;
   }
   get country(){
      return this._country;
   }
   get email(){
      return this._email;
   }
   get password(){
      return this._password;
   }
   get photo(){
      return this._photo;
   }
   get admin(){
      return this._admin;
   }    

   set photo(value){
      this._photo = value;
   }

   loadFromJSON(json){
      for (let name in json){
         switch(name){
            case '_register':
              this[name] = new Date(json[name]);
             break;
            default:
              this[name] = json[name];
         }
      }
   }

    static getUsersStorage(){
      let users = [];

      if(localStorage.getItem("users")){
          users = JSON.parse(localStorage.getItem("users"));
      }
    return users;
  }

  getNewId(){//Criar novo id
    let usersId = parseInt(localStorage.getItem("usersId")); // Se não tiver Id ele converte em INT e depois fica 0 na condição 

    if(!usersId > 0) usersId = 0; //Se não existir atribui id 0
    usersId++; //Independente se criou ou não cria-se um id
 
    localStorage.setItem("usersId", usersId); //Guarda o ultimo id gerado

    return usersId;
  }

   save(){ //Salvar usuário no localStorage
       let users = User.getUsersStorage();//Pegar todos os usuários até o momento
       if(this.id > 0){ //Editando usuário - id
            users.map(u=>{
              if(u._id == this.id){
                Object.assign(u, this); //Mesclar os dois objetos
              }
               return u;
            });


       } else{ //Não tem id, gera um novo - Criando id
         this._id = this.getNewId();

         users.push(this);//Adicionar mais um
       } 
    
    localStorage.setItem("users", JSON.stringify(users)); //Guardar novamente array no localStorage
   }

   remove(){
     let users = User.getUsersStorage();

       //Remover apenas o que foi clicado
       users.forEach((userData, index)=>{
          if(this._id == userData._id){
             users.splice(index, 1); // 1 É a quantidade
          }
       });
     localStorage.setItem("users", JSON.stringify(users)); //Guardar novamente array no localStorage
   }
}
