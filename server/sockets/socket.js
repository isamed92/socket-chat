const { io } = require('../server');

const { Usuarios } = require('../classes/usuarios.js');

const { crearMensaje } = require('../utils/utilidades');

const usuarios = new Usuarios();

io.on('connection', (client) => {


    client.on('entrarChat', function(data, callback){

        // console.log(data);
        if (!data.nombre || !data.sala){
            return callback({
                error: true, 
                message: 'El nombre y sala son necesarios'
            })
        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id,data.nombre, data.sala);


        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('admin', `${data.nombre} se unio`));

        
        callback(usuarios.getPersonasPorSala(data.sala));

    });



    client.on('crearMensaje', (data, callback) =>{
        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);


        
        callback(mensaje);
    });
    
    client.on('disconnect', ()=>{
        let personaBorrada =usuarios.borrarPersona(client.id);


        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('admin', `${personaBorrada.nombre} salio`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));



    });

    //mensaje privados
    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));


    });





});