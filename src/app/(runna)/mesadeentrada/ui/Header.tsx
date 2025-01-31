
import React from 'react';

const Header: React.FC = () => {
    return (
        <div className="bg-white p-4 flex justify-between items-center border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">
                Bienvenido a <span className="text-sky-500">Mesa de Entradas</span>
            </h1>
            <span className="text-gray-500">
                {new Date().toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                })} |{' '}
                {new Date().toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </span>
        </div>
    );
};

export default Header;